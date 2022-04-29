const fetcher = require("./fetcher");
const parseArgs = require('minimist')

const args = parseArgs(process.argv.slice(2), { string: "wallet"});

if(args.wallet) {
  fetcher.getInfo(args.wallet).then(res => {
    console.log(res);
  });
} else {
  console.log("parameter format is wrong. should follow: --wallet=0x");
}