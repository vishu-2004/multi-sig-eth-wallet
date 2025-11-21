// WallletPage.tsx
import React, { useEffect, useState } from "react";
import Blockies from "react-blockies"; // NEW
import { useAccount, useBalance } from "wagmi"; // OPTIONAL: will show real balance if your wagmi/provider is configured
import { Copy, ExternalLink, X } from "lucide-react"; // NEW (icons)
import { formatEther } from "viem";
import { MdOutlineVerified } from "react-icons/md";
import ActionModal from "../components/ActionModal";
import { useParams, useNavigate } from "react-router";
import { getWalletContract } from "../../utils/contract";
import { ethers } from "ethers";
import axios from "axios";

type Tx = {
  id: string;
  approvals: string;
  value: string;
  destination: string;
  data?: string;
  state: "Pending" | "Approved" | "Executed";
};

export default function WalletPage() {
  const { address, isConnected } = useAccount(); // ✅ wagmi address
  const { data: balance } = useBalance({ address });
  const { walletAddress } = useParams();
  const navigate = useNavigate();
  const [walletContract, setWalletContract] = useState<any>(null);
  const [etherscanLink, setEtherScanLink] = useState("https://etherscan.io"); // example
  const [walletBalance, setWalletBalance] = useState("0");
  // --- page state
  const [owners, setOwners] = useState<string[]>([

  ]);
  const [timelock, setTimeLock] = useState(0);


 // ⭐ Clean helper (CHANGE: auto-normalize timestamps)
const toMs = (ts:number) => (ts > 1e12 ? ts : ts * 1000);

const diffSeconds = (a:number, b:number) => {
  const msA = toMs(a); // CHANGE
  const msB = toMs(b); // CHANGE
  return Math.abs(msA - msB) / 1000;
};


  const fetchTransactions = async (contract: any) => {
    try {
      const count = Number(await contract.getTransactionCount());
      const threshold = Number(await contract.getThreshold());
      setApprovalRequired(threshold);
      const txList: Tx[] = [];
      for (let i = 0; i < count; i++) {
        const [destination, value, data, approvals, executed] = await contract.getTransactionDetails(i);
        let state: "Pending" | "Approved" | "Executed" = executed ? "Executed" : Number(approvals) >= threshold ? "Approved" : "Pending";
        if (isConnected) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          const isAlreadyapproved = await contract.isApproved(i, signer.address);
          if (isAlreadyapproved && state === "Pending") {
            state = "Approved";
          }
        }
        console.log("State:", state);
        txList.push({
          id: i.toString(),
          approvals: `${Number(approvals)}/${threshold}`,
          value: ethers.formatEther(value),
          destination,
          data: data || "0x",
          state,
        });
      }
      setTxs(txList);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };
   const fetchTx = async (transactionId:string) => {
              
              try {
                  const res = await axios.get("http://localhost:5000/api/transactions", {
                      params: { transactionId: Number(transactionId), walletAddress }, // use actual params
                  });
                  // expect the API to return a single transaction object in res.data
                  console.log(res.data[0]);
                  return res.data[0];
              } catch (err: any) {
                  console.error(err?.message || "Failed to fetch transaction");
              } 
          };

  // Add navigation on transaction row click
  const onTransactionClick = (txId: string) => {
    if (!walletAddress) return;
    navigate(`/transaction-details/${walletAddress}/${txId}`);
  };

  useEffect(() => {
    if (!walletAddress) return;

    setEtherScanLink(`https://etherscan.io/address/${walletAddress}`);

    const initWallet = async () => {
      try {
        // Assuming getWalletContract is async
        const contract = await getWalletContract(walletAddress);
        setWalletContract(contract);

        // Get wallet balance
        const provider = new ethers.JsonRpcProvider(); // or your custom provider
        const balance = await provider.getBalance(walletAddress);
        setWalletBalance(ethers.formatEther(balance)); // formatted in ETH

        const approvalsReq = await contract.minimumCount();
        setApprovalRequired(Number(approvalsReq));
        const timelock = await contract.timeLockDelay(); // assuming public uint timelock
        // store as number in state, key = walletAddress
        setTimeLock(Number(timelock));
        const ownersList = await contract.getOwners();
        setOwners(ownersList);

        // Fetch transactions
        await fetchTransactions(contract);
      } catch (err) {
        console.error("Error initializing wallet:", err);
      }
    };

    initWallet();
  }, [walletAddress, address]);

  const compactAddress = `${walletAddress}`;
  const compactAddress2 = address
    ? `${address.slice(0, 6)}....${address.slice(-6)}`
    : "";



  const [txs, setTxs] = useState<Tx[]>([]); // NEW

  // form fields for new transaction
  const [toAddress, setToAddress] = useState<string>("");
  const [value, setValue] = useState<string>("");

  // loading & notification
  const [isLoading, setIsLoading] = useState<boolean>(false); // NEW - blocks UI when true
  const [txModal, setTxModal] = useState<{ open: boolean; txId?: string }>({ open: false }); // NEW
  const [approvalsRequired, setApprovalRequired] = useState(2);
  const [modal, setModal] = useState<{ open: boolean; txId?: string; action?: "approve" | "revoke" | "execute"; errorMessage?: string }>({ open: false });
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositedAmount, setDepositedAmount] = useState<string>("");
  const [depositSuccessModal, setDepositSuccessModal] = useState(false);
  const [approvedTxs, setApprovedTxs] = useState<string[]>();
  const [errorModal, setErrorModal] = useState<{ open: boolean, message: string }>({ open: false, message: "" });



  // helper: shorten address like 0xA2aE...b23C
  const shorten = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  //MARK:app,re,exe
  const approveTransaction = async (txId: string) => {
    if (!walletContract) return;

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = walletContract.connect(signer);
      const isAlreadyApproved = await contractWithSigner.isApproved(txId, signer.address);

      const tx = await contractWithSigner.approveTransaction(parseInt(txId));
      await tx.wait();
      await fetchTransactions(walletContract);
      setModal({ open: false });
    } catch (err: any) {
      console.error("Error approving transaction:", err);
      const errorMessage = err?.reason || err?.message || "Something went wrong";
      setErrorModal({ open: true, message: errorMessage });
    }
    setIsLoading(false);
  };

  const revokeTransaction = async (txId: string) => {
    if (!walletContract) return;
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = walletContract.connect(signer);
      const tx = await contractWithSigner.revokeApproval(parseInt(txId));
      await tx.wait();
      await fetchTransactions(walletContract);
      setModal({ open: false });
    } catch (err: any) {
      console.error("Error revoking approval:", err);
      const errorMessage = err?.reason || err?.message || "Something went wrong";
      setErrorModal({ open: true, message: errorMessage });
    }
    setIsLoading(false);
  };

  const timelockPassed = async (txId:string)=>{
    const trx = await fetchTx(txId);
    const submitUnix = trx.submittedAt;
    const nowSec = Math.floor(Date.now() / 1000);

    const diffsec = diffSeconds(submitUnix,nowSec)
    if(diffsec > timelock){
      return true;
    }
    return false;
  }

  const executeTransaction = async (txId: string) => {
    if (!walletContract) return;
    if(!timelockPassed(txId)){
      const errorMessage =  "TimeLock period has not elapsed. Try again later.";
      setErrorModal({ open: true, message: errorMessage });
      
    }
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = walletContract.connect(signer);
      const tx = await contractWithSigner.executeTransaction(parseInt(txId));
      await tx.wait();
      await fetchTransactions(walletContract);
      const balance = await provider.getBalance(walletAddress);
      setWalletBalance(ethers.formatEther(balance)); // formatted in ETH
      setModal({ open: false });
    } catch (err: any) {
      console.error("Error executing transaction:", err);
      const errorMessage = err?.reason || err?.message || "Something went wrong";
      setErrorModal({ open: true, message: errorMessage });
    }
    setIsLoading(false);
  };


  // submit tx
  const submitTx = async () => {
    if (!toAddress || !value || !walletContract) return;
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = walletContract.connect(signer);
      const tx = await contractWithSigner.submitTransaction(toAddress, ethers.parseEther(value), "0x");
      await tx.wait();
      const count = Number(await walletContract.getTransactionCount());
      const txId = count - 1;
      await fetchTransactions(walletContract);
      setTxModal({ open: true, txId: txId.toString() });
      // clear form
      setToAddress("");
      setValue("");
    } catch (err: any) {
      console.error("Error submitting transaction:", err);
      const errorMessage = err?.reason || err?.message || "Something went wrong";
      setErrorModal({ open: true, message: errorMessage });
    }
    setIsLoading(false);
  };
  const handleDeposit = async () => {
    if (!walletAddress || !depositAmount) return;

    try {
      // You need a signer to send transactions
      const provider = new ethers.BrowserProvider(window.ethereum); // MetaMask
      const signer = await provider.getSigner();

      // Create transaction
      const tx = await signer.sendTransaction({
        to: walletAddress, // contract address
        value: ethers.parseEther(depositAmount) // convert ETH to wei
      });

      console.log("Transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      const balance = await provider.getBalance(walletAddress);
      setWalletBalance(ethers.formatEther(balance));
      setDepositedAmount(depositAmount);
      setDepositSuccessModal(true);
      setDepositAmount("");
    } catch (err: any) {
      console.error("Error sending Ether:", err);
      const errorMessage = err?.reason || err?.message || "Something went wrong";
      setErrorModal({ open: true, message: errorMessage });
    }
  }

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
      <div className="flex mb-6 mr-18 justify-center">
        <div className="relative inline-flex">

          <span className="bg-neutral-900 text-center font-semibold rounded-r-none text-sm text-white rounded-4xl pt-2.5 px-4 pr-23 py-2.5">{balance ? `${parseFloat(formatEther(balance.value)).toFixed(3)}` : "7.077"} ETH</span>

          <div className="bg-green-400 absolute left-25 gap-3 items-center inline-flex rounded-4xl px-4 py-1">
            <span className=" text-black text-sm font-mono font-semibold ">{compactAddress2}</span>
            <Blockies seed={(address || owners[0]).toLowerCase()} size={10} scale={3} className="rounded-full" />
          </div>

        </div>
      </div>
      {/* Back to User Wallets button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate('/user-wallets')}
          className="px-15 border-green-400 border-2  text-md font-semibold py-3 rounded-3xl bg-neutral-900 text-white hover:bg-neutral-700 ml-7 transition"
        >
          Switch wallet
        </button>
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 ">
          {/* Left: Wallet address box */}
          <div className="col-span-3 ">
            <div className="bg-neutral-900 rounded-xl p-4 flex-1  gap-4">
              <div className="flex-1 items-center justify-center">
                <div className="text-sm text-center text-gray-400">Your VaultX Wallet Address</div>
                <div className="mt-3 flex justify-center">

                  <div className=" inline-flex items-center   gap-3 bg-black border border-neutral-800 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">

                      <div className="font-mono text-sm">{compactAddress}</div>
                    </div>

                    {/* copy + external (right side) */}
                    <div className=" flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(walletAddress || "0x")}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 mt-3 gap-3 items-stretch">

              <div className="col-span-1 ">
                <div className="bg-neutral-900 rounded-xl p-4 h-full flex flex-col">

                  <h3 className="text-lg font-semibold mb-3">All Owners</h3>
                  <div className="space-y-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">

                    {owners.map((o, i) => (
                      <div key={o} className="flex items-center gap-3 bg-black border border-neutral-800 rounded-lg px-2 py-2 cursor-pointer hover:bg-neutral-800 transition" onClick={() => navigate(`/user-profile/${o}`)}>
                        <Blockies seed={o.toLowerCase()} size={8} scale={3} className="rounded-xl" />
                        <div className="flex-1 font-mono text-sm truncate">{shorten(o)}</div>
                        <button className="text-gray-400 hover:text-green-400" onClick={(e) => { e.stopPropagation(); copyToClipboard(o); }}>
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right: Wallet Balance box */}
              <div className="col-span-1">
                <div className="bg-neutral-900 rounded-xl p-4 h-full flex flex-col">

                  <div className="text-lg text-gray-400 mb-4">Wallet Balance</div>
                  <div className="text-3xl mt-6 md:text-4xl font-bold text-green-400">{walletBalance ? `${walletBalance}` : "0.000"}

                  </div>
                  <div className="mt-8 mb-4.5 flex gap-3">
                    <input
                      type="text"
                      placeholder="value in ETH"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 md:w-48 bg-black border border-neutral-800 rounded-xl pl-3   py-2 text-white placeholder:text-gray-500"
                    />
                    <button onClick={handleDeposit} className="px-3 rounded-xl border border-neutral-700 text-green-400 hover:bg-green-400 hover:text-black transition">
                      Deposit
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Submit a new transaction (wide) */}
            <div className="bg-neutral-900 rounded-xl p-6 mt-3">
              <h3 className="text-xl font-semibold mb-4">Submit A New Transaction</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm mb-1 text-gray-400">Recipient address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-3 text-white mt-2 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Value</label>
                  <input
                    type="text"
                    placeholder="value in ETH"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white  mt-2 placeholder:text-gray-500"
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
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-neutral-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Wallet Transactions</h3>

              {txs.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No transactions yet. Create a transaction first.
                </div>
              ) : (
                <>
                  {/* Table header (approvals/value/to/data/states) */}
                  <div className="hidden md:grid grid-cols-5 gap-5 text-gray-400 text-sm mb-3">
                    <div className="ml-[-10]">Approvals</div>
                    <div className="ml-0">Value</div>
                    <div className="ml-4">To</div>
                    <div>Data</div>
                    <div>States</div>
                  </div>

                  {/* Transactions list */}
                  <div className="space-y-3">
                    {txs.map((t) => (

                      <div
                        key={t.id}
                        onClick={() => navigate(`/transaction-details/${walletAddress}/${t.id}`)}
                        className="cursor-pointer bg-black border border-neutral-800 rounded-lg p-3 flex items-center gap-3"
                      >
                        <div className="w-18 text-sm text-center text-gray-300">{t.approvals}</div>
                        <div className="w-17  text-center text-sm">{t.value}</div>
                        <div className="  text-sm ">{`${t.destination.slice(0, 5)}...${t.destination.slice(-5)}`}</div>
                        <div className="w-12 text-center text-sm">{t.data}</div>
                        <div className="w-28 flex items-center justify-end gap-3">
                          {t.state === "Executed" ? (
                            <span className="text-green-400 text-sm font-semibold">Executed</span>
                          ) : t.state === "Approved" &&
                            parseInt(t.approvals.split("/")[0]) === approvalsRequired ? (
                            <button
                              className="px-2 py-1 rounded-md bg-green-400 text-black text-sm font-semibold hover:bg-green-600"
                              onClick={(e) => {
                                e.stopPropagation(); // 🟢 prevent parent navigation
                                setModal({ open: true, txId: t.id, action: "execute" });
                              }}
                            >
                              Execute
                            </button>
                          ) : t.state === "Approved" ? (
                            <button
                              className="px-3 py-1 rounded-md bg-red-400 text-black text-sm font-semibold hover:bg-red-500"
                              onClick={(e) => {
                                e.stopPropagation(); // 🟢 prevent parent navigation
                                setModal({ open: true, txId: t.id, action: "revoke" });
                              }}
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              className="px-2 py-1 rounded-md bg-green-400 text-black text-sm font-semibold hover:bg-green-500"
                              onClick={(e) => {
                                e.stopPropagation(); // 🟢 prevent parent navigation
                                setModal({ open: true, txId: t.id, action: "approve" });
                              }}
                            >
                              Approve
                            </button>
                          )}
                        </div>

                      </div>

                    ))}
                  </div>
                </>
              )}
            </div>
          </div>


        </div>





      </div>

      {/* --- TRANSACTION SUBMITTED MODAL (NEW) --- */}
      {txModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-neutral-900 rounded-2xl p-6 w-full max-w-md z-10">
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

      <ActionModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        onConfirm={() => {
          if (!modal.txId) return;
          if (modal.action === "approve" || modal.action === "execute" || modal.action === "revoke") {
            setModal({ open: false })
          }
          if (modal.action === "approve") approveTransaction(modal.txId);
          if (modal.action === "revoke") revokeTransaction(modal.txId);
          if (modal.action === "execute") executeTransaction(modal.txId);
        }}
        title={modal.action === "approve" ? "Approve Transaction" : modal.action === "revoke" ? "Revoke Approval" : "Execute Transaction"}
        body={`Are you sure you want to ${modal.action} this transaction?`}
      />

      <ActionModal
        open={depositSuccessModal}
        onClose={() => setDepositSuccessModal(false)}
        onConfirm={() => setDepositSuccessModal(false)}
        title="Deposit Successful"
        body={`Successfully deposited ${depositedAmount} ETH to the wallet.`}
      />

      <ActionModal
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: "" })}
        title="Error"
        body=""
        errorMessage={errorModal.message}
      />

    </div>
  );
}
