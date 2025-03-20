module.exports = async function scrapeCoinDesk() {
    const url = "https://www.coindesk.com/";
    const fetchWithRetry = require("../utils/fetchWithRetry");
    const cheerio = require("cheerio"); 

    try {
        const data = await fetchWithRetry(url);
        const $ = cheerio.load(data);

        return $(".font-headline-xs").map((_, element) => {
            let link = $(element).closest("a").attr("href") || "";
            link = link.startsWith("http") ? link : `${url}${link}`;

            // Find the publish date in the next sibling <span> element
            let publishDate = $(element).closest("div").find("span.md\\:ml-2").text().trim() || "Unknown";

            return {
                headline: $(element).text().trim(),
                link,
                source: "CoinDesk",
                publishDate,
            };
        }).get();
    } catch (error) {
        console.error("❌ Error scraping CoinDesk:", error);
        return [];
    }
};
