import factoryABI from "../abi/MultiSigFactory.json" assert { type: 'json' };
import dotenv from "dotenv";
import listenToWallet from "../listeners/walletListener.js";
import { ethers } from "ethers";
dotenv.config();

export default async function bootstrapWalletListeners(provider) {
  const factory = new ethers.Contract(process.env.CONTRACT_ADDRESS, factoryABI, provider);
  const wallets = await factory.allWallets(); 

  wallets.forEach(walletAddress => {
    listenToWallet(walletAddress,provider);
  });
}
