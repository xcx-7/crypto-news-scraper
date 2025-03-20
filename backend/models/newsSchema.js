const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
    headline: { type: String, required: true },
    link: { type: String, required: true, unique: true }, 
    source: String,
    author: String,
    summary: String,
    thumbnail: String,
    publishDate: String 
});

const News = mongoose.model("News", newsSchema);
module.exports = News;
