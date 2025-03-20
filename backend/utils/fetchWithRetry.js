const axios = require("axios");
const headers = { "User-Agent": "Mozilla/5.0" };
module.exports = async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return (await axios.get(url, { headers })).data;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
};
