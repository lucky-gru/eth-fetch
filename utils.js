const axios = require("axios");

const tokenSource = "https://tokens.coingecko.com/uniswap/all.json";

const getTokens = async () => {
  try {
    const res = await axios.get(tokenSource);
    return res.data;  
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getTokens,
};