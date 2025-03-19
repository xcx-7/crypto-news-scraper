const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const mongoose = require("mongoose");
const News = require("./newsSchema"); 
const express = require("express");
const cors = require("cors");
const PORT = 5000;

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://kritiakter0:x3v1YKTpF3PlcCF5@cluster0.zniow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
};

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(url, { headers });
            return data;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`⚠️ Retrying... (${i + 1}/${retries})`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}

// Scraper for CryptoNews
async function scrapeCryptoNews() {
    const url = "https://crypto.news/";
    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);
        const articles = [];

        $(".home-latest-news-item__title").each((index, element) => {
            const headline = $(element).text().trim();
            const link = $(element).closest("a").attr("href") || "";
            
            if (headline && link) {
                articles.push({
                    headline,
                    link: link.startsWith("http") ? link : `${url}${link}`,
                    source: "CryptoNews"
                });
            }
        });
        return articles;
    } catch (error) {
        console.error("❌ Error scraping CryptoNews:", error);
        return [];
    }
}

// Scraper for CoinDesk
async function scrapeCoinDesk() {
    const url = "https://www.coindesk.com/";
    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);
        const articles = [];

        $(".font-headline-xs").each((index, element) => {
            const headline = $(element).text().trim();
            const link = $(element).closest("a").attr("href") || "";
            
            if (headline && link) {
                articles.push({
                    headline,
                    link: link.startsWith("http") ? link : `${url}${link}`,
                    source: "CoinDesk"
                });
            }
        });
        return articles;
    } catch (error) {
        console.error("❌ Error scraping CoinDesk:", error);
        return [];
    }
}

async function saveNewsToDB(newsArticles) {
    for (const article of newsArticles) {
        try {
            const exists = await News.exists({ link: article.link });
            if (!exists) {
                await News.create(article);
                console.log(`✅ Saved: ${article.headline}`);
            } else {
                console.log(`⏭️ Skipped (already in DB): ${article.headline}`);
            }
        } catch (error) {
            console.error("❌ Error saving article:", error);
        }
    }
}

async function scrapeAndSaveNews() {
    console.log("🔍 Scraping latest crypto news...");
    const allArticles = [];

    const cryptoNews = await scrapeCryptoNews();
    const coinDeskNews = await scrapeCoinDesk();
    
    allArticles.push(...cryptoNews, ...coinDeskNews);

    console.log(`📜 Total Articles Found: ${allArticles.length}`);
    if (allArticles.length > 0) {
        await saveNewsToDB(allArticles);
    } else {
        console.log("❌ No new articles found.");
    }
}

cron.schedule("0 * * * *", () => {
    console.log("⏳ Running scheduled scraper...");
    scrapeAndSaveNews();
});

scrapeAndSaveNews();

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
