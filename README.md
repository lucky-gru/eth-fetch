# eth-fetch
Javascript module to fetch wallet info with ETH, ERC20 tokens, and transactions

Used coingecko API to get token & ether prices, and alchemy API to get token list, balances, and transactions for an address. Fetch only 5 transactions from genesis block of etherem.
## Instructions
### Install
npm install

### Set Env
1. Change .env.sample to .env
2. Paste your alchemy mainnet api key. Follow their instructions to get API key. [https://docs.alchemy.com/alchemy/]
### Commnad & Test


node index.js --wallet="0x"