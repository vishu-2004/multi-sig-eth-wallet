import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from "../src/provider";
import FactorycontractAbi from "../abi/MultiSigFactory.json";
import WalletcontractAbi from "../abi/MultiSigWallet.json";

const CONTRACT_ADDRESS = "0xccCB8b84207300A4C5C0A7072E287fE11BB68533";

export async function readWalletFactory(functionName: string, args: any[] = []) {
  return await readContract(wagmiConfig, {
    address: CONTRACT_ADDRESS,
    abi: FactorycontractAbi.abi,
    functionName,
    args,

  });
}

export async function writeWalletFactory(functionName: string, args: any[]) {
  const hash = await writeContract(wagmiConfig, {
    address: CONTRACT_ADDRESS,
    abi: FactorycontractAbi.abi,
    functionName,
    args,
  });
  
  return hash;
}

export async function readFromWallet(
  walletAddress: `0x${string}`,
  functionName: string,
  args: any[] = []
) {
  return await readContract(wagmiConfig, {
    address: walletAddress,
    abi: WalletcontractAbi.abi,
    functionName,
    args,
  });
}

export async function writeToWallet(
  walletAddress: `0x${string}`, 
  functionName: string, 
  args: any[]
) {
  const hash = await writeContract(wagmiConfig, {
    address: walletAddress,
    abi: WalletcontractAbi.abi,
    functionName,
    args,
  });
  
  return hash;
}

export async function waitForTx(hash: `0x${string}`) {
  return await waitForTransactionReceipt(wagmiConfig, { hash });
}