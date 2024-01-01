require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",

  networks: {
    hardhat: {
      throwOnCallFailures: false,
      throwOnTransactionFailures: false,
    },
  },
};
