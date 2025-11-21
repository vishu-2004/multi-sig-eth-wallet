import { ethers } from "ethers";
import FactorycontractAbi from "../abi/MultiSigFactory.json";
import WalletcontractAbi from "../abi/MultiSigWallet.json";
import { getWalletClient } from '@wagmi/core';
import { wagmiConfig } from "../src/provider";

// 🔥 NEW: env-based network switch
const isProd = import.meta.env.VITE_PROD === "true";
const SEPOLIA_RPC = import.meta.env.VITE_SEPOLIA_RPC_URL;

const LOCAL_RPC = "http://127.0.0.1:8545";

const CONTRACT_ADDRESS = "0x75CeF35f64768999A9a276F7f6721c9868F5e770";

function getRpcProvider() {
  const rpcUrl = isProd ? SEPOLIA_RPC : LOCAL_RPC;
  return new ethers.JsonRpcProvider(rpcUrl);
}

// Read-only factory contract
export async function getReadWalletFactoryContract() {
  const provider = getRpcProvider();          // ✅ UPDATED
  return new ethers.Contract(CONTRACT_ADDRESS, FactorycontractAbi.abi, provider);
}

// Write (Signer) - works for mobile & desktop
export async function getWriteWalletFactoryContract() {
  const client = await getWalletClient(wagmiConfig);
  if (!client) throw new Error("Wallet not connected");

  const provider = new ethers.BrowserProvider(client);  // Uses wallet provider (not RPC)
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, FactorycontractAbi.abi, signer);
}

export async function getWalletContract(walletAddress: string) {
  const client = await getWalletClient(wagmiConfig);
  if (!client) throw new Error("Wallet not connected");

  const provider = new ethers.BrowserProvider(client);
  const signer = await provider.getSigner();

  return new ethers.Contract(walletAddress, WalletcontractAbi.abi, signer);
}
