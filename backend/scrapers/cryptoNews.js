const axios = require("axios");
const cheerio = require("cheerio");
const fetchWithRetry = require("../utils/fetchWithRetry");

module.exports = async function scrapeCryptoNews() {
    const url = "https://crypto.news/";
    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);
        return $(".home-latest-news-item").map((_, element) => ({
            headline: $(element).find(".home-latest-news-item__title").text().trim(),
            link: $(element).find("a").attr("href") || "",
            source: "CryptoNews",
            publishDate: $(element).find("time").attr("datetime") || "Unknown",
        })).get();
    } catch (error) {
        console.error("❌ Error scraping CryptoNews:", error);
        return [];
    }
};
