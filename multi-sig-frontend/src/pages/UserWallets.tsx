import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Blockies from "react-blockies";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

type WalletItem = {
  address: string;
  label: string; // CHANGED: make label required
};

export default function UserWallets() {
  

  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({ address: connectedAddress });

  // UPDATED: added label field in dummy data
  const [wallets, setWallets] = useState<WalletItem[]>([
    {
      address: "0x742d35Cc8C5f57a0C99C5B2E7C9F7e8B4A5D6F3E",
      label: "Friendly Sepolia Wallet",
    },
    {
      address: "0x8E9A2F4B6C1D3E5F7G8H9I0J1K2L3M4N5O6P7Q8R",
      label: "Friendly Sepolia Wallet",
    },
    {
      address: "0x1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U",
      label: "Friendly Sepolia Wallet",
    },
  ]);

  const shorten = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}....${addr.slice(-6)}`;
  };

  const genDummyAddress = () => {
    const rand = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    return `0x${rand}`;
  };

  // UPDATED: always set label to Friendly Sepolia Wallet
  const createWallet = () => {
    const newAddr = genDummyAddress();
    setWallets((s) => [
      { address: newAddr, label: "Friendly Sepolia Wallet" },
      ...s,
    ]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto mb-6 flex items-start justify-between">
        <h1 className="text-2xl font-bold text-green-400">User Wallets</h1>

        <div className="text-right">
          <div className="inline-flex items-center gap-3 bg-green-400 rounded-4xl px-4 py-2">
            <Blockies
              seed={connectedAddress?.toLowerCase()}
              size={8}
              scale={3}
              className="rounded-full"
            />
            <div className="text-black font-mono font-semibold text-sm">
              {shorten(connectedAddress)}
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-400">
            Balance:{" "}
            {balance && balance.value
              ? `${parseFloat(formatEther(balance.value)).toFixed(3)} ETH`
              : "Loading..."}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-6 mt-10 items-center flex justify-between">
        <h2 className="text-xl font-semibold text-white">Wallets</h2>
        <button
          onClick={createWallet}
          className="px-4 py-2 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500 transition"
        >
          Create Wallet
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-neutral-900 rounded-2xl p-4">
        {wallets.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            No wallets — create a wallet first
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((w) => (
              <div
                key={w.address}
                className="flex items-center justify-between bg-neutral-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Blockies
                    seed={w.address.toLowerCase()}
                    size={8}
                    scale={3}
                    className="rounded-full mr-1.5"
                  />
                  <div className="flex flex-col">
                    {/* NEW: label displayed */}
                    <span className="font-semibold text-white">
                      {w.label}
                    </span>
                    
                    <span className="font-mono mt-0.5 text-gray-300">{w.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
