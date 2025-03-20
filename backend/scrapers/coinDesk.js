const axios = require("axios");
const cheerio = require("cheerio");
const fetchWithRetry = require("../utils/fetchWithRetry");

module.exports = async function scrapeCoinDesk() {
    const url = "https://www.coindesk.com/";
    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);
        return $(".font-headline-xs").map((_, element) => ({
            headline: $(element).text().trim(),
            link: $(element).closest("a").attr("href") || "",
            source: "CoinDesk",
        })).get();
    } catch (error) {
        console.error("❌ Error scraping CoinDesk:", error);
        return [];
    }
};
