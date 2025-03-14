const puppeteer = require('puppeteer');

async function scrapeCryptoTweets() {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const searchQuery = "crypto";
        const url = `https://nitter.net/search?q=${encodeURIComponent(searchQuery)}&f=crypto&f=tweets`;

        await page.goto(url, { waitUntil: 'networkidle2' });

        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for tweets to load
        }

        const tweets = await page.evaluate(() => {
            const tweetElements = document.querySelectorAll('.timeline-item');
            return Array.from(tweetElements).map(tweet => tweet.innerText.trim());
        });

        console.log('Latest Crypto Tweets:');
        console.log(tweets);
    } catch (error) {
        console.error('Error scraping tweets:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

scrapeCryptoTweets();
