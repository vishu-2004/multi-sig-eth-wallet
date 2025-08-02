import dotenv from "dotenv";
import listenToWallet from "../listeners/walletListener.js";
import { ethers } from "ethers";
import { createRequire } from 'module';

dotenv.config();
const require = createRequire(import.meta.url);
const factoryABI = require('../abi/MultiSigFactory.json');

export default async function bootstrapWalletListeners(provider) {
  try {
    const factory = new ethers.Contract(
      process.env.CONTRACT_ADDRESS, 
      factoryABI.abi || factoryABI, 
      provider
    );
    
    console.log('Fetching all existing wallets...');
    
    const wallets = [];
    let index = 0;
    
    // Keep calling allWallets(index) until we get an error or zero address
    while (true) {
      try {
        const walletAddress = await factory.allWallets(index);
        
        // Check if we got a valid address
        if (walletAddress === ethers.ZeroAddress || walletAddress === "0x0000000000000000000000000000000000000000") {
          break;
        }
        
        wallets.push(walletAddress);
        console.log(`Found wallet ${index}: ${walletAddress}`);
        index++;
        
      } catch (error) {
        // No more wallets available at this index
        console.log(`Finished fetching wallets at index ${index}`);
        break;
      }
    }
    
    console.log(`Total wallets found: ${wallets.length}`);
    
    // Set up listeners for each wallet
    wallets.forEach((walletAddress, i) => {
      console.log(`Setting up listener for wallet ${i + 1}/${wallets.length}: ${walletAddress}`);
      listenToWallet(walletAddress, provider);
    });
    
    return wallets;
    
  } catch (error) {
    console.error("Error in bootstrapWalletListeners:", error);
    return [];
  }
}