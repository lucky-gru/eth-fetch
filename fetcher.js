require("dotenv").config();
const createAlchemyWeb3 = require("@alch/alchemy-web3").createAlchemyWeb3;
const axios = require("axios");
const BigNumber = require("big-number");
const { getTokens } = require("./utils");

const { API_URL } = process.env;

// Using HTTPS
const web3 = createAlchemyWeb3(API_URL);

const getEther = async (address) => {
  try {
    const weiBalance = await web3.eth.getBalance(address);
    const eth = web3.utils.fromWei(weiBalance);
    return eth;
  } catch (err) {
    throw err;
  }
};

const getEtherPrice = async (currency) => {
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${currency}`
    );
    return Number(res.data["ethereum"][currency]);
  } catch (err) {
    throw err;
  }
};

const getTokenPrice = async (platform, contractAddress, currency) => {
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=${currency}`
    );
    return Number(res.data[contractAddress][currency]);
  } catch (err) {
    throw err;
  }
};

const getTokenBalances = async (address) => {
  try {
    const { tokens } = await getTokens();

    const balances = await web3.alchemy.getTokenBalances(address);

    let formattedBalances = balances.tokenBalances.map((balance) => {
      const token = tokens.find(
        (token) => token.address === balance.contractAddress
      );
      if (token) {
        return {
          symbol: token.symbol,
          address: balance.contractAddress,
          quantity: balance.tokenBalance,
        };
      } else {
        return {
          address: balance.contractAddress,
          quantity: balance.tokenBalance,
        };
      }
    });
    formattedBalances = formattedBalances.filter((balance) => {
      if (balance.quantity === "0" || !balance.symbol) return false;
      return true;
    });

    return formattedBalances;
  } catch (err) {
    throw err;
  }
};

const getTransactions = async (address) => {
  const data = JSON.stringify({
    jsonrpc: "2.0",
    id: 0,
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromBlock: "0x0",
        fromAddress: address,
        maxCount: "0x5",
        excludeZeroValue: true,
        category: ["external", "internal", "erc20"],
      },
    ],
  });

  const config = {
    method: "post",
    url: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
    data,
  };

  try {
    const res = await axios(config);
    if (res && res.data && res.data.result) return res.data.result.transfers;
    return [];
  } catch (err) {
    throw err;
  }
};

const getInfo = async (address) => {
  const res = await Promise.all([
    getEther(address),
    getTokenBalances(address),
    getTransactions(address),
    getEtherPrice("usd"),
  ]);

  const pricePromises = res[1].map((token) =>
    getTokenPrice("ethereum", token.address, "usd")
  );
  const tokenPrices = await Promise.all(pricePromises);
  const positions = res[1].map((token, index) => {
    return {
      ...token,
      usd: (Number(token.quantity) * tokenPrices[index]).toString(),
    };
  });

  return {
    balance: res[0],
    usd: (Number(res[0]) * res[3]).toString(),
    positions: positions,
    transactions: res[2],
  };
};

module.exports = {
  getEther,
  getTokenBalances,
  getTransactions,
  getInfo,
};
