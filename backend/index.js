// const axios = require('axios');
// const cheerio = require('cheerio');

// const url = 'https://www.coindesk.com/';

// async function scrapeNews() {
//     try {
//         const { data } = await axios.get(url);
        
//         const $ = cheerio.load(data);

//         const articles = [];
        
//         $('.font-headline-xs').each((index, element) => {
//             const headline = $(element).text().trim();
//             const link = $(element).attr('href');
            
//             articles.push({
//                 headline,
//                 link: `https://www.coindesk.com${link}`,
//             });
//         });

//         console.log(articles);
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// }

// scrapeNews();





const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.coindesk.com/';

async function scrapeNews() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const articles = [];

        // Target the .font-headline-xs elements
        $('.font-headline-xs').each((index, element) => {
            const headline = $(element).text().trim();

            // Find the closest parent <a> tag or a sibling <a> tag
            const linkElement = $(element).closest('a');
            const link = linkElement.attr('href');

            if (headline && link) {
                articles.push({
                    headline,
                    link: `https://www.coindesk.com${link}`,
                });
            }
        });

        console.log(articles);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

scrapeNews();