const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const mongoose = require("mongoose");
const News = require("./newsSchema"); 

const MONGO_URI = "mongodb+srv://kritiakter0:x3v1YKTpF3PlcCF5@cluster0.zniow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const websites = [
    {
        name: "CryptoNews",
        url: "https://crypto.news/",
        selector: ".home-latest-news-item__title",
        baseUrl: "https://crypto.news/",
    },
    {
        name: "CoinDesk",
        url: "https://www.coindesk.com/",
        selector: ".font-headline-xs",
        baseUrl: "https://www.coindesk.com",
    },
];

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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

async function scrapeWebsite({ url, selector, baseUrl }) {
    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);

        const articles = [];

        $(selector).each((index, element) => {
            const headline = $(element).text().trim();
            const linkElement = $(element).closest("a");
            const link = linkElement.attr("href");

            // Scrape additional data safely
            const publishDate =
                $(element).closest(".article").find(".publish-date").text().trim() || "Unknown";
            const author =
                $(element).closest(".article").find(".author").text().trim() || "Unknown";
            const summary =
                $(element).closest(".article").find(".summary").text().trim() || "No summary available";
            const thumbnail =
                $(element).closest(".article").find("img").attr("src") || "";

            if (headline && link) {
                articles.push({
                    headline,
                    link: link.startsWith("http") ? link : `${baseUrl}${link}`,
                    publishDate,
                    author,
                    summary,
                    thumbnail,
                });
            }
        });

        return articles;
    } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error);
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

    let allArticles = [];

    for (const website of websites) {
        console.log(`🌐 Scraping ${website.name}...`);
        const articles = await scrapeWebsite(website);
        allArticles.push(...articles);
    }

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
