// WallletPage.tsx
import React, { useState } from "react";
import Blockies from "react-blockies"; // NEW
import { useAccount, useBalance } from "wagmi"; // OPTIONAL: will show real balance if your wagmi/provider is configured
import { Copy, ExternalLink, X } from "lucide-react"; // NEW (icons)
import { formatEther } from "viem";
import { MdOutlineVerified } from "react-icons/md";

type Tx = {
  id: string;
  approvals: string;
  value: string;
  to: string;
  data?: string;
  state?: "Pending" | "Approved";
};

export default function WalletPage() {
  const { address, isConnected } = useAccount(); // ✅ wagmi address
  const { data: balance } = useBalance({ address });


  // --- page state
  const [owners] = useState<string[]>([
    "0x5e6b84251a27...43248b6c3ffb", // ✅ keep as extra dummy owner
    "0x1f28d959c57...625ae8291fca",
  ]);

  const compactAddress = `${address}`;


  // dummy transactions initially (you said use dummy data)
  const [txs, setTxs] = useState<Tx[]>([
    { id: "tx-01", approvals: "0/2", value: "0.5 ETH", to: "0x1f...1fCa", data: "0x", state: "Pending" },
    { id: "tx-02", approvals: "1/2", value: "0.1 ETH", to: "0xab...cD3", data: "0x", state: "Pending" },
  ]); // NEW

  // form fields for new transaction
  const [toAddress, setToAddress] = useState<string>("");
  const [value, setValue] = useState<string>("");

  // loading & notification
  const [isLoading, setIsLoading] = useState<boolean>(false); // NEW - blocks UI when true
  const [txModal, setTxModal] = useState<{ open: boolean; txId?: string }>({ open: false }); // NEW
  const [etherscanLink] = useState("https://etherscan.io/address/0x123..."); // example


  // helper: shorten address like 0xA2aE...b23C
  const shorten = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // submit tx (simulated)
  const submitTx = async () => {
    if (!toAddress || !value) return;
    setIsLoading(true); // NEW: show blocking overlay spinner
    // simulate network delay
    await new Promise((r) => setTimeout(r, 1400));
    const txId = `0x${Math.random().toString(36).slice(2, 10)}`;
    const newTx: Tx = {
      id: txId,
      approvals: "0/2",
      value: `${value} ETH`,
      to: toAddress,
      data: "0x",
      state: "Pending",
    };
    setTxs((s) => [newTx, ...s]);
    setIsLoading(false);
    setTxModal({ open: true, txId }); // NEW: show popup with tx id
    // clear form
    setToAddress("");
    setValue("");
  };

  const closeModal = () => setTxModal({ open: false });

  // copy helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // optional: small visual feedback could be added
    } catch {
      // ignore
    }
  };

  return (
    <div className={`min-h-screen p-6 md:p-12 bg-black text-white relative`}>
      {/* TOP: wallet address + balance box */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
          {/* Left: Wallet address box */}
          <div className="col-span-2 ">
            <div className="bg-neutral-900 rounded-md p-4 flex-1  gap-4">
              <div className="flex-1 items-center justify-center">
                <div className="text-sm text-center text-gray-400">Your VaultX Wallet Address</div>
                <div className="mt-3 flex justify-center">

                  <div className=" inline-flex items-center   gap-3 bg-black border border-neutral-800 rounded-md px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Blockies seed={(address || owners[0]).toLowerCase()} size={8} scale={3} className="rounded-full" />
                      <div className="font-mono text-sm">{compactAddress}</div>
                    </div>

                    {/* copy + external (right side) */}
                    <div className=" flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(address || owners[0])}
                        className="text-gray-400 hover:text-green-400"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                </div>
                <div className="mt-5 mb-3 flex justify-center">
                  <div className="inline-flex items-center gap-2">
                    <MdOutlineVerified size={15} />
                    <span
                      onClick={() => window.open(etherscanLink, "_blank")}
                      className="text-white underline cursor-pointer hover:text-green-400"
                    >
                      View verified address on etherscan
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex-row grid grid-cols-1 lg:grid-cols-2 mt-3 gap-2">
              <div className="col-span-1 ">
                <div className="bg-neutral-900 rounded-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Owners</h3>
                  <div className="space-y-3">
                    {owners.map((o, i) => (
                      <div key={o} className="flex items-center gap-3 bg-black border border-neutral-800 rounded-md px-3 py-3">
                        <Blockies seed={o.toLowerCase()} size={8} scale={3} className="rounded-md" />
                        <div className="flex-1 font-mono text-sm truncate">{shorten(o)}</div>
                        <button className="text-gray-400 hover:text-green-400" onClick={() => copyToClipboard(o)}>
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right: Wallet Balance box */}
              <div className="col-span-1">
                <div className="bg-neutral-900 rounded-md p-4">
                  <div className="text-sm text-gray-400 mb-4">Wallet Balance</div>
                  <div className="text-2xl mt-6 md:text-3xl font-bold text-green-400">{balance ? `${formatEther(balance.value)} ETH` : "Loading..."}
                  </div>
                  <div className="mt-8 mb-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="value in ETH"
                      value={""}
                      onChange={() => { }}
                      className="flex-1 bg-black border border-neutral-800 rounded-md px-3 py-2 text-white placeholder:text-gray-500"
                      disabled
                    />
                    <button className="px-3 rounded-md border border-neutral-700 text-green-400 hover:bg-green-400 hover:text-black transition">
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Submit a new transaction (wide) */}
            <div className="bg-neutral-900 rounded-md p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Submit A New Transaction</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-400">Recipient address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-md px-3 py-3 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">value</label>
                  <input
                    type="text"
                    placeholder="value in ETH"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-md px-3 py-3 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    onClick={submitTx}
                    disabled={isLoading}
                    className="mt-4 w-full px-6 py-3 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500 transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-1">
            <div className="bg-neutral-900 rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4">Wallet Transactions</h3>

              {/* Table header (approvals/value/to/data/states) */}
              <div className="hidden md:grid grid-cols-5 gap-4 text-gray-400 text-sm mb-3">
                <div>Approvals</div>
                <div>Value</div>
                <div>To</div>
                <div>Data</div>
                <div>States</div>
              </div>

              {/* Transactions list */}
              <div className="space-y-3">
                {txs.map((t) => (
                  <div key={t.id} className="bg-black border border-neutral-800 rounded-md p-3 flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-300">{t.approvals}</div>
                    <div className="w-24 text-sm">{t.value}</div>
                    <div className="flex-1 font-mono text-sm truncate">{t.to}</div>
                    <div className="w-12 text-sm">{t.data}</div>
                    <div className="w-28 flex items-center justify-end gap-3">
                      <button className="px-3 py-1 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>

        {/* MAIN GRID: Owners (left) + Transactions (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Owners (left column) */}


          {/* Center: Wallet Balance box (already above) - leave placeholder so layout resembles screenshot */}
          <div className="col-span-1">
            {/* Keep blank to match layout spacing; we already show balance on top */}
            <div className="bg-transparent h-full" />
          </div>

          {/* Right: Wallet Transactions (occupies two-thirds on wide screens) */}

        </div>


      </div>

      {/* --- TRANSACTION SUBMITTED MODAL (NEW) --- */}
      {txModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-neutral-900 rounded-md p-6 w-full max-w-md z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="font-semibold">Transaction submitted</div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-sm text-gray-300">
              transaction submitted as txid-<span className="font-mono">{txModal.txId}</span>
            </div>
            <div className="mt-6 text-right">
              <button onClick={closeModal} className="px-4 py-2 rounded-md border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BLOCKING LOADING OVERLAY (NEW) --- */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/70" />

          {/* Green circular spinner */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <svg
              className="animate-spin"
              width="56"
              height="56"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="25" cy="25" r="20" stroke="#064e3b" strokeWidth="6" opacity="0.2" />
              <path
                d="M45 25a20 20 0 0 1-20 20"
                stroke="#22c55e"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-green-400 font-medium">Processing transaction...</div>
          </div>
        </div>
      )}
    </div>
  );
}
