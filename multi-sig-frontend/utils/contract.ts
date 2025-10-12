import { ethers } from "ethers";
import FactorycontractAbi from "../abi/MultiSigFactory.json";
import WalletcontractAbi from "../abi/MultiSigWallet.json"

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Contract for read-only calls
export async function getReadWalletFactoryContract() {
  // Point directly to your Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(CONTRACT_ADDRESS, FactorycontractAbi.abi, provider);
}

// Contract with signer (write transactions only)
export async function getWriteWalletFactoryContract() {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask provider not found");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
const network = await provider.getNetwork();
console.log("Connected chainId:", network.chainId.toString());
console.log("Network name:", network.name);

  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, FactorycontractAbi.abi, signer);
}

export async function getWalletContract(walletAddress: string) {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask provider not found");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(walletAddress, WalletcontractAbi.abi, signer);
}