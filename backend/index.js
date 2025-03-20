require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const scrapeCryptoNews = require("./scrapers/cryptoNews");
const scrapeCoinDesk = require("./scrapers/coinDesk");
const saveNewsToDB = require("./utils/saveNewsToDB");
const News = require("./models/newsSchema");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.use(cors());
app.use(express.json());

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));



// API Endpoint to get news
app.get("/api/news", async (req, res) => {
    try {
        const news = await News.find().sort({ _id: -1 }).limit(20);
        res.json(news);
    } catch (error) {
        console.error("❌ Error fetching news:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

async function scrapeAndSaveNews() {
    console.log("🔍 Scraping latest crypto news...");
    const allArticles = [...(await scrapeCryptoNews()), ...(await scrapeCoinDesk())];
    console.log(`📜 Total Articles Found: ${allArticles.length}`);
    if (allArticles.length > 0) await saveNewsToDB(allArticles);
}

cron.schedule("0 * * * *", scrapeAndSaveNews);
scrapeAndSaveNews();

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
