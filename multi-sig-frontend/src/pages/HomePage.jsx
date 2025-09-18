import { ConnectButton } from "@rainbow-me/rainbowkit";
import VaultXLogo from "../assets/Vaultx.png";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { isConnected } = useAccount();   // get wallet connection state
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/create-wallet");   // auto redirect if already connected
    }
  }, [isConnected, navigate]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center m-12 p-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl md:rounded-none md:rounded-l-xl">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
          Unlock a new way <br /> of ownership
        </h1>
        <p className="text-lg mb-6 max-w-lg">
          The most trusted decentralized custody protocol and collective asset
          management platform.
        </p>
        <ul className="space-y-4 text-base">
          <li className="flex items-center gap-2">
            <span className="text-xl">✔</span> Enhanced security with multiple signers
          </li>
          <li className="flex items-center gap-2">
            <span className="text-xl">✔</span> Full control over your funds, always
          </li>
          <li className="flex items-center gap-2">
            <span className="text-xl">✔</span> Connect with any wallet seamlessly
          </li>
        </ul>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center  p-13">
        <div className="bg-neutral-900 rounded-xl shadow-lg py-25  p-25 w-full max-w-md text-center">
          <div className="flex justify-center mb-15 items-center gap-1">
            <img
              src={VaultXLogo}
              alt="VaultX"
              className="h-9 w-9 object-contain"
            />
            <p className="text-white text-xl font-semibold">VaultX</p>
          </div>

          <h2 className="text-2xl font-bold mb-4">Get started</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to create a new VaultX Account or open an existing
            one
          </p>

          {/* RainbowKit Connect Button */}
          <div className="mb-6">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full py-3 rounded-md font-semibold text-black bg-green-400 hover:bg-green-500 transition"
                >
                  Connect wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </div>
  );
}
