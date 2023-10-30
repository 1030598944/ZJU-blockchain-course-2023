import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://127.0.0.1:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x1d29cbb16a88a76c08fcf4553e20df72438d502ae03e12174dcdaad27cf089c4',
        '0x5324f80d78302fe56713e37696b89ecb97c71d7a1e12d339db2528719dc0bb31'
      ]
    },
  },
};

export default config;
