const News = require("../models/newsSchema");
module.exports = async function saveNewsToDB(newsArticles) {
    for (const article of newsArticles) {
        try {
            if (!await News.exists({ link: article.link })) {
                await News.create({ ...article, publishDate: new Date() });
                console.log(`✅ Saved: ${article.headline}`);
            } else {
                console.log(`⏭️ Skipped: ${article.headline}`);
            }
        } catch (error) {
            console.error("❌ Error saving article:", error);
        }
    }
};
