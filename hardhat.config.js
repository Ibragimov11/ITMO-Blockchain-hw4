import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config()


const CHAIN_IDS = {
  hardhat: 31337,
};


/** @type import('hardhat/config').HardhatUserConfig */
export const defaultNetwork = "hardhat";
export const networks = {
  hardhat: {
    chainId: CHAIN_IDS.hardhat,
    forking: {
      url: "https://eth-mainnet.g.alchemy.com/v2/lhprCKFZGUDhc7nj9SeYqA7myg-u-TnY",
    },
  },
};
export const solidity = "0.8.17";
