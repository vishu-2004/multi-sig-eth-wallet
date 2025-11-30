import dotenv from "dotenv";
import listenToWallet from "../listeners/walletListener.js";
import { ethers } from "ethers";
import { createRequire } from "module";

dotenv.config();
const require = createRequire(import.meta.url);
const factoryABI = require("../abi/MultiSigFactory.json");

export default async function bootstrapWalletListeners(factory, provider) {
  try {
    console.log("Fetching all existing wallets...");

    // Get all wallets in a single call
    const wallets = await factory.getAllWallets();

    console.log(`Total wallets found: ${wallets.length}`);

    wallets.forEach((walletAddress, i) => {
      console.log(
        `Setting up listener for wallet ${i + 1}/${wallets.length}: ${walletAddress}`
      );
      listenToWallet(walletAddress, provider);
    });

    return wallets;
  } catch (error) {
    console.error("Error in bootstrapWalletListeners:", error);
    return [];
  }
}
