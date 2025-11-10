import { useEffect, useState } from "react";
import { useChain, useAccount, useSwitchChain } from "wagmi";
import ActionModal from "../components/ActionModal";
import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";  // 🟢 ADDED for connection modal

export default function NetworkGuard({ children }) {
  // 🟢 Added address to detect account change
  const { isConnected, address } = useAccount();
  const { chain } = useChain();
  const { switchChain } = useSwitchChain();
  const navigate = useNavigate();

  const isProd = import.meta.env.VITE_PROD === "true";
  const requiredChainId = isProd ? 11155111 : 31337; // Sepolia / Hardhat
  const requiredNetworkName = isProd ? "Sepolia" : "Hardhat Local";

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 🟢 "network" or "connection"
  const [modalBody, setModalBody] = useState("");

  // 🟢 Detect both wrong network and disconnected wallet/account
  useEffect(() => {
    
    if (!isConnected) {
      setModalType("connection");
      setModalBody("This account isn't connected to VaultX. Please connect this account from your wallet to continue using VaultX.");
      setShowModal(true);
      return;
    }

    if (chain?.id !== requiredChainId) {
      setModalType("network");
      setModalBody(`Please switch to ${requiredNetworkName} network to continue.`);
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isConnected, address, chain?.id]); // 🟢 includes address to react to account changes

  return (
    <>
      {children}

      {/* 🟢 Hidden ConnectButton to trigger openConnectModal manually */}
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <ActionModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={async () => {
              try {
                if (modalType === "network") {
                  await switchChain({ chainId: requiredChainId });
                } else if (modalType === "connection") {
                  openConnectModal(); // 🟢 Triggers wallet connect popup
                }
                setShowModal(false);
              } catch (err) {
                console.error("Action failed:", err);
              }
            }}
            title={modalType === "network" ? "Wrong Network" : "Connect Wallet"}
            body={modalBody}
          />
        )}
      </ConnectButton.Custom>
    </>
  );
}
