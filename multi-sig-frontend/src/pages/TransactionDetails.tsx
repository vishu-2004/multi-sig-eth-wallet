// TransactionDetails.tsx
import React, { useEffect, useState } from "react";
import axios from "axios"; // ADDED
import Blockies from "react-blockies";
import { useParams } from "react-router-dom"; // ADDED (expects react-router)
import { formatEther } from "ethers";

// Type matching your mongoose schema (excluded walletAddress per request)
type TxFromApi = {
    walletAddress: string;
    transactionId: number;
    destination: string;
    value: number;
    approvals: number;
    data?: string;
    submittedBy: string;
    executedBy?: string | null;
    submittedAt?: number | null;
    executedAt?: number | null;
    approvedBy?: string[];
};

export default function TransactionDetails() {
    // get params passed to this page (transactionId, walletAddress)
    const { transactionId, walletAddress } = useParams<{ transactionId?: string; walletAddress?: string }>(); // ADDED

    // store all data in state (as requested)
    const [tx, setTx] = useState<TxFromApi | null>(null); // ADDED
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // fetch transaction on mount / when params change
    useEffect(() => {
        // if (!transactionId || !walletAddress) return;

        const fetchTx = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get("http://localhost:5000/api/transactions", {
                    params: { transactionId: Number(1), walletAddress: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be" }, // ADDED
                });
                // expect the API to return a single transaction object in res.data
                console.log(res.data[0]);
                setTx(res.data[0]); // ADDED: store API result in state
            } catch (err: any) {
                setError(err?.message || "Failed to fetch transaction");
            } finally {
                setLoading(false);
            }
        };

        fetchTx();
    }, [transactionId, walletAddress]);

    // helper: convert unix timestamp (seconds or ms) -> readable string
    const toReadable = (ts?: number | null) => {
        if (ts == null) return "-";
        const n = Number(ts);
        if (Number.isNaN(n)) return "-";
        const ms = n > 1e12 ? n : n * 1000; // detect seconds vs milliseconds
        return new Date(ms).toLocaleString();
    };

    // helper: shorten address like 0x2341....231423
    const shorten = (addr?: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}....${addr.slice(-6)}`;
    };

    if (loading) return <div className="p-6 bg-black text-white">Loading transaction...</div>;
    if (error) return <div className="p-6 bg-black text-white">Error: {error}</div>;
    if (!tx) return <div className="p-6 bg-black text-white">No transaction found</div>;

    return (
        <div className="bg-black min-h-screen min-w-screen justify-center items-center">
            <div className="p-6 min-h-screen  bg-black text-white max-w-3xl mx-auto">
                <div className="bg-neutral-900 rounded-md p-6">
                    <h2 className="text-lg font-semibold mb-5">Transaction Details</h2>

                    {/* TRX prefix */}
                    <div className="bg-black border border-neutral-800 mb-3 rounded-md p-3">
                        <div className="text-sm text-gray-400">Transaction ID:</div>
                        <div className="text-sm">TRX-{tx.transactionId} {/* assume ETH numeric; if wei use formatEther */}</div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Destination (Blockies + full + shortened) */}

                        <div className=" bg-black border border-neutral-800 rounded-md px-3 py-3">
                            <div className="text-sm text-gray-400 mb-1">Reciever</div>
                            <div className="flex items-center gap-3">


                                <Blockies seed={tx.destination.toLowerCase()} size={8} scale={3} className="rounded-full" /> {/* ADDED */}
                                <div>
                                    <div className="text-sm font-mono">{tx.destination}</div>

                                </div>
                            </div>
                        </div>

                        {/* Value */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400">Value</div>
                            <div className="text-sm">
                                {parseFloat(formatEther(BigInt(tx.value))).toFixed(4)} ETH
                            </div>
                        </div>

                        {/* Approvals count */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400">Approvals</div>
                            <div className="text-sm">{tx.approvals}</div>
                        </div>

                        {/* Submitted By */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400 mb-1">Submitted By</div>
                            <div className="flex items-center gap-3">
                                <Blockies seed={tx.submittedBy.toLowerCase()} size={8} scale={3} className="rounded-full" /> {/* ADDED */}
                                <div className="text-sm font-mono">{tx.submittedBy}</div>
                            </div>
                        </div>

                        {/* Submitted At */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400">Submitted At</div>
                            <div className="text-sm">{toReadable(tx.submittedAt)}</div>
                        </div>

                        {/* Executed By (show '-' when missing) */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400">Executed By</div>
                            <div className="text-sm">{tx.executedBy ?? "-"}</div>
                        </div>

                        {/* Executed At (show '-' when missing) */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400">Executed At</div>
                            <div className="text-sm">{tx.executedAt ? toReadable(tx.executedAt) : "-"}</div>
                        </div>

                        {/* Approved By list (one per line) */}
                        <div className="bg-black border border-neutral-800 rounded-md p-3">
                            <div className="text-sm text-gray-400 mb-2">Approved By</div>
                            <div className="space-y-2">
                                {tx.approvedBy && tx.approvedBy.length ? (
                                    tx.approvedBy.map((addr) => (
                                        <div key={addr} className="flex items-center gap-3 bg-neutral-900 rounded-md px-3 py-2">
                                            <Blockies seed={addr.toLowerCase()} size={6} scale={3} className="rounded-full" /> {/* ADDED */}
                                            <div className="text-sm font-mono">{addr}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm">-</div>
                                )}
                            </div>
                        </div>

                        {/* Data (if provided) */}
                        {tx.data && (
                            <div className="bg-black border border-neutral-800 rounded-md p-3">
                                <div className="text-sm text-gray-400">Data</div>
                                <div className="text-sm font-mono truncate">{tx.data}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
