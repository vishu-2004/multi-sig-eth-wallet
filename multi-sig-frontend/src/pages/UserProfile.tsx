import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Blockies from "react-blockies";

interface UserActivity {
    userAddress: string;
    activityType: string;
    timestamp: number; // unix timestamp in seconds
    walletAddress: string;
    transactionId: number;
}

export default function UserProfile() {
      const { userAddress } = useParams<{ userAddress: string }>();

    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/getUserActivity?userAddress=${userAddress}`);
                const data = await res.json();
                console.log(data);

                if (data.error) {
                    setError(data.error);
                    setActivities([]);
                } else if (Array.isArray(data)) {
                    setActivities(data);
                } else {
                    setError("Unexpected response format");
                    setActivities([]);
                }
            } catch (err) {
                console.error("Error fetching activities:", err);
                setError("Failed to fetch user activity");
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        if (userAddress) {
            fetchActivity();
        }
    }, [userAddress]);

    // Helper: format unix timestamp
    const formatTimestamp = (unix: number) => {
        return new Date(unix * 1000).toLocaleString(); // convert seconds → ms
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            {/* Page Heading */}
            {/* <h1 className="text-2xl font-bold mb-6 text-left mr-130 text-green-400">User Profile</h1> */}

            {/* User Address Section */}
            {userAddress && (
                <div className="inline-flex items-center gap-3 bg-green-400 rounded-4xl px-4 py-2 mb-10 mt-10">
                    <Blockies
                        seed={userAddress.toLowerCase()}
                        size={10}
                        scale={3}
                        className="rounded-full"
                    />
                    <span className="font-semibold font-mono text-black">{userAddress}</span>
                </div>
            )}
<div className="flex-1">
            {/* Activities Section */}
<h2 className="text-xl font-semibold mb-5 **w-full text-left** text-white">
  User Activity
</h2>


            <div className="w-full max-w-2xl bg-neutral-900 rounded-2xl p-4 space-y-3">
                {loading ? (
                    <p className="text-center text-gray-400">Loading activities...</p>
                ) : error ? (
                    <p className="text-center text-gray-400">{error}</p>
                ) : activities.length === 0 ? (
                    <p className="text-center text-gray-400">No activity found</p>
                ) : (
                    activities.map((act, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center bg-neutral-800 rounded-xl px-4 py-2"
                        >
                            <div className="flex flex-col">
                                <span className="font-semibold text-white">{act.activityType}</span>
                                <span className="text-sm text-gray-400">
                                    Wallet: {act.walletAddress}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Tx ID: TRX-{act.transactionId}
                                </span>
                            </div>
                            <div className="text-xs ml-9 mt-2 text-gray-400">
                                {formatTimestamp(act.timestamp)}
                            </div>
                        </div>
                    ))
                )}
            </div>
            </div>
        </div>
    );
}
