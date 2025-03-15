require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi(process.env.BEARER_TOKEN);

// const client = new TwitterApi({
//     appKey: process.env.API_KEY,
//     appSecret: process.env.API_KEY_SECRET,
//     accessToken: process.env.ACCESS_TOKEN,
//     accessSecret: process.env.ACCESS_TOKEN_SECRET
//   });

// async function getCryptoTweets() {
//     try {
//       const query = 'crypto OR bitcoin OR ethereum OR blockchain OR web3 -filter:retweets';
      
//       const response = await client.v2.search(query, {
//         max_results: 10, 
//         'tweet.fields': 'created_at,entities'
//       });
  
//       const tweets = response.data.map(tweet => {
//         const tweetText = tweet.text.split('\n')[0]; 
//         const tweetSnippet = tweet.text.length > 100 ? tweet.text.slice(0, 100) + '...' : tweet.text; // Short snippet
//         const tweetLink = `https://twitter.com/i/web/status/${tweet.id}`; 
        
//         return {
//           headline: tweetText,
//           snippet: tweetSnippet,
//           link: tweetLink
//         };
//       });
  
//       console.log(tweets);
//     } catch (error) {
//       console.error('Error fetching tweets:', error);
//     }
//   }
  



async function getCryptoTweets() {
  try {
    const query = 'crypto OR bitcoin OR ethereum OR blockchain OR web3';
    
    const response = await client.v2.search(query, {
      max_results: 10,
      'tweet.fields': 'created_at,entities'
    });

    const tweets = response.data.map(tweet => ({
      headline: tweet.text.split('\n')[0],
      snippet: tweet.text.length > 100 ? tweet.text.slice(0, 100) + '...' : tweet.text,
      link: `https://twitter.com/i/web/status/${tweet.id}`
    }));

    console.log(tweets);
  } catch (error) {
    console.error('Error fetching tweets:', error);
  }
}

  getCryptoTweets();
