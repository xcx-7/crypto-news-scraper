const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

const websites = [
    {
        name: 'CryptoNews',
        url: 'https://crypto.news/',
        selector: '.home-latest-news-item__title',
        baseUrl: 'https://crypto.news/',
    },
    {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/',
        selector: '.font-headline-xs',
        baseUrl: 'https://www.coindesk.com',
    },
];

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
};

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(url, { headers });
            return data;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`Retrying... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
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
            const linkElement = $(element).closest('a');
            const link = linkElement.attr('href');

            // Scrape additional data
            const publishDate = $(element).closest('.article').find('.publish-date').text().trim();
            const author = $(element).closest('.article').find('.author').text().trim();
            const summary = $(element).closest('.article').find('.summary').text().trim();
            const thumbnail = $(element).closest('.article').find('img').attr('src');

            if (headline && link) {
                articles.push({
                    headline,
                    link: link.startsWith('http') ? link : `${baseUrl}${link}`,
                    publishDate,
                    author,
                    summary,
                    thumbnail,
                });
            }
        });

        return articles;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return [];
    }
}

async function scrapeAllWebsites() {
    const allArticles = [];

    for (const website of websites) {
        console.log(`Scraping ${website.name}...`);
        const articles = await scrapeWebsite(website);
        allArticles.push(...articles);
    }

    console.log('Latest Crypto News:');
    console.log(allArticles);
}

cron.schedule('0 * * * *', () => {
    console.log('Running scraper...');
    scrapeAllWebsites();
});

scrapeAllWebsites();