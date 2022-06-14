
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      //forking: { url: process.env.MAINNET_API || "", blockNumber: 14877894 },
    },
  },
  paths: {
    sources: "./contracts/",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "src/types",
  },
};

export default config;


// require("@nomiclabs/hardhat-waffle");
// require("dotenv").config();

// let PRIVATE_KEY = process.env.PRIVATE_KEY;
// module.exports = {
//   networks: {
//     bscTestnet: {
//       url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
//       chainId: 97,
//       gasPrice: 20000000000,
//       accounts: [PRIVATE_KEY],
//     },
//   },
//   solidity: {
//     version: "0.8.7",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//     },
//   },
//   paths: {
//     sources: "./contracts/",
//     tests: "./test",
//     cache: "./cache",
//     artifacts: "./artifacts",
//   },
//   mocha: {
//     timeout: 20000,
//   },
//   etherscan: {
//     apiKey: {
//       bscTestnet: "",
//     },
//   },
// };


// import { task } from "hardhat/config";
// import "@nomiclabs/hardhat-waffle";
// import '@typechain/hardhat'
// import '@nomiclabs/hardhat-ethers'

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (args, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(await account.address);
//   }
// });

// // You need to export an object to set up your config
// // Go to https://hardhat.org/config/ to learn more

// export default {
//   solidity: "0.8.7"

// };

