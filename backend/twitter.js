const puppeteer = require('puppeteer');

async function scrapeCryptoTweets() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const searchQuery = "crypto"; // Change this to other keywords if needed

  // Go to the Nitter search page
//   const url = `https://nitter.poast.org/search?q=${searchQuery}&f=tweets`;
const url = `https://nitter.cz/search?q=crypto&f=tweets`;

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll down to load more tweets
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for tweets to load
  }

  // Extract tweets
  const tweets = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('article'))
      .map(tweet => tweet.innerText.trim());
  });

  console.log(tweets);
  await browser.close();
}

scrapeCryptoTweets();
