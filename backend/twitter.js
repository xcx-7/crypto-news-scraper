const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeTwitter() {
  const url = 'https://nitter.net/nodejs'; // Alternative frontend to Twitter
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const tweets = [];
  $('.timeline-item .tweet-content').each((i, el) => {
    tweets.push($(el).text().trim());
  });

  console.log(tweets);
}

scrapeTwitter();
