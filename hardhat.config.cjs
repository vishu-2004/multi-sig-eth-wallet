
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox")
require('hardhat-deploy');

module.exports = {
  solidity: "0.8.28",

  
  // networks: {
  //   sepolia: {
  //     url: process.env.SEPOLIA_RPC_URL,
  //     accounts: [process.env.PRIVATE_KEY],
  //   }
  // }

  // In your hardhat.config.js
networks: {
  hardhat: {
    chainId: 31337
  },
  localhost: {
    url: "http://127.0.0.1:8545",
    chainId: 31337
  }
}
};
