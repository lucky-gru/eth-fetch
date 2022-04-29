require("dotenv").config();
const createAlchemyWeb3 = require("@alch/alchemy-web3").createAlchemyWeb3;
const axios = require("axios");

const { getTokens } = require('./utils');

const { API_URL } = process.env;

// Using HTTPS
const web3 = createAlchemyWeb3(API_URL);

const getEther = async (address) => {
  try {
    const weiBalance = await web3.eth.getBalance(address);
    const eth = web3.utils.fromWei(weiBalance);
    return eth;
  } catch(err) {
    throw err
  }
}

const getTokenBalances = async (address) => {
  try {
    const { tokens } = await getTokens();

    const balances = await web3.alchemy.getTokenBalances(address);
  
    let formattedBalances = balances.tokenBalances.map((balance) => {
      const token = tokens.find(token => token.address === balance.contractAddress);
      if(token) {
        return {
          symbol: token.symbol,
          quantity: balance.tokenBalance
        }
      } else {
        return {
          address: balance.contractAddress,
          quantity: balance.tokenBalance
        }
      }
    });
    formattedBalances = formattedBalances.filter((balance) => {
      if(balance.quantity === '0' || !balance.symbol) return false;
      return true;
    })
  
    return formattedBalances;  
  } catch(err) {
    throw err;
  }
}


const getTransactions = async (address) => {
  const data = JSON.stringify({
    "jsonrpc": "2.0",
    "id": 0,
    "method": "alchemy_getAssetTransfers",
    "params": [
      {
        "fromBlock": "0x0",
        "fromAddress": address,
        "maxCount": "0x5",
        "excludeZeroValue": true,
        "category": [
          "external",
          "internal",
          "erc20"
        ]
      }
    ]
  });
  
  const config = {
    method: 'post',
    url: API_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    data,
  };

  try {
    const res = await axios(config);
    if(res && res.data && res.data.result) return res.data.result.transfers;
    return [];
  } catch(err) {
    throw err;
  }
}

const getInfo = async (address) => {
  const res = await Promise.all([
    getEther(address),
    getTokenBalances(address),
    getTransactions(address)
  ]);
  return {
    balance: res[0],
    positions: res[1],
    transactions: res[2]
  };
}

module.exports = {
  getEther,
  getTokenBalances,
  getTransactions,
  getInfo,
}