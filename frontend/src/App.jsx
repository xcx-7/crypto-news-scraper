import React, { useEffect, useState } from "react";

const App = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/news")
            .then((res) => res.json())
            .then((data) => setNews(data))
            .catch((error) => console.error("Error fetching news:", error));
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>📰 Crypto News</h1>
            {news.length === 0 ? (
                <p>Loading...</p>
            ) : (
                news.map((article, index) => (
                    <div key={index} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
                        <h3>
                            <a href={article.link} target="_blank" rel="noopener noreferrer">
                                {article.headline}
                            </a>
                        </h3>
                        <p><strong>Author:</strong> {article.author}</p>
                        <p><strong>Date:</strong> {article.publishDate}</p>
                        <p>{article.summary}</p>
                        {article.thumbnail && (
                            <img src={article.thumbnail} alt="Thumbnail" style={{ width: "150px", height: "auto" }} />
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default App;
