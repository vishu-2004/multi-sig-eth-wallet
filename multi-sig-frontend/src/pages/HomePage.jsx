import { ConnectButton } from "@rainbow-me/rainbowkit";
import VaultXLogo from "../assets/Vaultx.png";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionModal from "../components/ActionModal";

export default function HomePage() {
  const { isConnected } = useAccount();   // get wallet connection state
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [connectPressed,setConnectPressed] = useState(false);

  const isProd = import.meta.env.VITE_PROD === "true";
  const requiredChainId = isProd ? 11155111 : 31337; // Sepolia or Hardhat
  const requiredNetworkName = isProd ? "Sepolia" : "Hardhat Local";
useEffect(() => {
  console.log("isConnected:", isConnected);
  console.log("chain:", chainId);
}, [isConnected, chainId]);

  useEffect(() => {
  if (!isConnected) return; // wait for connection

  if (chainId === requiredChainId) {
    navigate("/user-wallets");
  } else if (chainId) {
    setModalTitle("Wrong Network");
    setModalBody(`Please switch to ${requiredNetworkName} network to proceed.`);
    setShowModal(true);
  }
}, [isConnected, chainId, navigate, requiredChainId]);

  
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
                      onClick={()=>{
                        openConnectModal();
                        setConnectPressed(!connectPressed);

                      }}
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

      {/* Action Modal */}
      <ActionModal
        open={showModal}
        onClose={() => setShowModal(false)}
       onConfirm={async () => {
    try {
      await switchChain({ chainId: requiredChainId });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to switch chain:", err);
    }
  }}
        title={modalTitle}
        body={modalBody}
      />
    </div>
  );
}
