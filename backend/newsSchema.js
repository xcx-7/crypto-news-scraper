const newsSchema = new mongoose.Schema({
    headline: { type: String, required: true },
    link: { type: String, required: true, unique: true }, // Ensure unique links
    publishDate: String,
    author: String,
    summary: String,
    thumbnail: String
});

export const News = mongoose.model("News", newsSchema);
