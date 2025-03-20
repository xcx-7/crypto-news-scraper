module.exports = async function scrapeCryptoNews() {
    const fetchWithRetry = require("../utils/fetchWithRetry");
const cheerio = require("cheerio"); 

    const url = "https://crypto.news/";
    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);
        return $(".home-latest-news-item").map((_, element) => {
            let link = $(element).find("a").attr("href") || "";
            link = link.startsWith("http") ? link : `${url}${link}`; 
            return {
                headline: $(element).find(".home-latest-news-item__title").text().trim(),
                link,
                source: "CryptoNews",
                publishDate: $(element).find("time").attr("datetime") || "Unknown",
            };
        }).get();
    } catch (error) {
        console.error("❌ Error scraping CryptoNews:", error);
        return [];
    }
};
