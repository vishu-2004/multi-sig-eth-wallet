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
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 lg:p-12">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center items-start p-12 lg:p-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl shadow-2xl min-h-96 lg:min-h-[500px]">
          <div className="max-w-lg w-full">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-6 leading-tight text-left">
              Unlock a new way <br /> of ownership
            </h1>
            <p className="text-base lg:text-lg mb-8 leading-relaxed">
              The most trusted decentralized custody protocol and collective asset
              management platform.
            </p>
            <ul className="space-y-4 text-sm lg:text-base">
              <li className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">✔</span> 
                <span>Enhanced security with multiple signers</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">✔</span> 
                <span>Full control over your funds, always</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">✔</span> 
                <span>Connect with any wallet seamlessly</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center p-12 lg:p-16 bg-neutral-900 rounded-xl shadow-2xl min-h-96 lg:min-h-[500px]">
          <div className="w-full max-w-sm text-center">
            {/* Logo Section */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <img
                src={VaultXLogo}
                alt="VaultX"
                className="h-8 w-8 object-contain"
              />
              <p className="text-white text-xl font-semibold">VaultX</p>
            </div>
            
            {/* Content Section */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold mb-4 text-white">
                Get started
              </h2>
              <p className="text-gray-400 mb-6 text-sm lg:text-base leading-relaxed">
                Connect your wallet to create a new VaultX Account or open an existing
                one
              </p>
              
              {/* RainbowKit Connect Button */}
              <div className="w-full">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="w-full py-3 px-5 rounded-lg font-semibold text-base text-black bg-green-400 hover:bg-green-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      Connect wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}