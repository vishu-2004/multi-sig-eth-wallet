import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Blockies from "react-blockies";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { getReadWalletFactoryContract } from "../../utils/contract";



export default function UserWallets() {
  

  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({ address: connectedAddress });
  const navigate = useNavigate();

  const [wallets, setWallets] = useState<string[]>(["0x742d35Cc8C5f57a0C99C5B2E7C9F7e8B4A5D6F3E",]);

  useEffect(() => {
  const fetchWallets = async () => {
    const factoryContract = await getReadWalletFactoryContract();

    // 1️⃣ get the count
    const count = await factoryContract.getUserWalletCount(connectedAddress);

    const wallets: string[] = [];
    // 2️⃣ fetch each wallet address using the mapping getter
    for (let i = 0; i < Number(count); i++) {
      const walletAddress = await factoryContract.userWallets(connectedAddress, i);
      wallets.push(walletAddress);
    }

    console.log(wallets);
    setWallets(wallets);
  };

  if (connectedAddress) {
    fetchWallets();
  }
}, [connectedAddress]);


  const shorten = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}....${addr.slice(-6)}`;
  };

  

  // UPDATED: always set label to Friendly Sepolia Wallet
  const createWallet = () => {
    navigate("/create-wallet");
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

          <div className="mt-2 text-sm mr-5 text-gray-300">
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
            {wallets.map((address) => (
              <div
                key={address}
                className="flex items-center justify-between bg-neutral-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Blockies
                    seed={address.toLowerCase()}
                    size={8}
                    scale={3}
                    className="rounded-full mr-1.5"
                  />
                  <div className="flex flex-col">
                    {/* NEW: label displayed */}
                    <span className="font-semibold text-white">
                      Friendly Sepolia Wallet
                    </span>
                    
                    <span className="font-mono mt-0.5 text-gray-300">{address}</span>
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
