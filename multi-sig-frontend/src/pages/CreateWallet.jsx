import VaultXLogo from "../assets/Vaultx.png";
import { useState, useEffect } from "react"; // NEW
import Blockies from "react-blockies";
import { useAccount } from "wagmi";
import { FiTrash2 } from "react-icons/fi"; // feather-style trash icon
import { getWriteWalletFactoryContract } from "../../utils/contract";
import { ethers } from "ethers";
import ActionModal from "../components/ActionModal";
import { useNavigate } from "react-router-dom";

const CreateWallet = () => {
  // NEW: step state (1 → basics, 2 → signers, 3 → placeholder)
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [name, setName] = useState("Fun Sepolia VaultX");
  const { address } = useAccount(); // connected wallet address
  const [isLoading,setIsLoading]  = useState(false);
  const [isModalOpen,setIsModalOpen] = useState(false);
  const [walletAddress,setWalletAddress] = useState("0x");

  // NEW: signers state (first signer is the connected wallet)

  // NEW: keep first signer address in sync with connected wallet
  useEffect(() => {
    setSigners((prev) => {
      const next = [...prev];
      next[0] = { ...next[0], address: address || "" };
      return next;
    });
  }, []);

  // NEW: threshold (min confirmations) & timelock (seconds)
  const [threshold, setThreshold] = useState(1);
  const [timelock, setTimelock] = useState(0);
  const [signers, setSigners] = useState([
    { name: "Signer 1", address: address || "" },
  ]);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // NEW: simple 0x-address validator
  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  // NEW: handlers for signer list


  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const factory = await getWriteWalletFactoryContract();
      const owners = signers.map(s => s.address);
      const tx = await factory.createWallet(owners, threshold, timelock);
      const receipt = await tx.wait();

      const walletCreatedEvent = factory.interface.parseLog(
        receipt.logs.find(log =>
            log.topics[0] === factory.interface.getEvent('WalletCreated').topicHash
        )
    );

    
      if (walletCreatedEvent) {
        const walletAddress = walletCreatedEvent.args.walletAddress;
        setWalletAddress(walletAddress);
        console.log("Created wallet address:", walletAddress);
        // Save timelock in localStorage with walletAddress as key
        localStorage.setItem(walletAddress, timelock.toString());
        setIsModalOpen(true);
        setSigners([
    { name: "Signer 1", address: address || "" },
  ])
  setTimelock(0);
  setThreshold(1);


      } else {
        console.error("WalletCreated event not found");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
    }finally{
      setIsLoading(false);
    }
  }
  const updateSignerName = (id, value) =>
    setSigners((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: value } : s))
    );

  const updateSignerAddress = (id, value) =>
    setSigners((prev) =>
      prev.map((s) => (s.id === id ? { ...s, address: value } : s))
    );

  // UPDATED: progress bar width by step (1/3, 2/3, 3/3)
  const progressPercent = `${(step / 3) * 100}%`;

  const handleSignerChange = (index, field, value) => {
    const updated = [...signers];
    updated[index][field] = value;
    setSigners(updated);
  };

  const addSigner = () => {
    setSigners([
      ...signers,
      { name: `Signer ${signers.length + 1}`, address: "" },
    ]);
  };

  const removeSigner = (index) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white p-6 md:p-12">
      {/* Left Section */}
      <div className="flex-1 bg-neutral-900 rounded-xl p-6 md:p-10 shadow-lg">
        {/* Header + Progress */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Create new VaultX Wallet
        </h1>

        <div className="mb-6">
          <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-1 bg-green-400 rounded-full transition-all duration-300"
              style={{ width: progressPercent }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">Step {step} of 3</p>
        </div>

        {/* STEP 1: Set up the basics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-500 text-black font-bold">
                  1
                </span>
                Set up the basics
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Give a name to your wallet and select which networks to deploy
                it on.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter wallet name"
              />
            </div>

            {/* Network (Sepolia only) */}
            <div>
              <label className="block text-sm mb-2">Select Network</label>
              <select
                className="w-full bg-black border border-neutral-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                defaultValue="sepolia"
              >
                <option value="sepolia">Sepolia</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button className="px-6 py-2 rounded-md border border-green-400 text-green-400 hover:bg-green-500 hover:text-black transition">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)} // NEW
                className="px-6 py-2 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Signers & confirmations (NEW) */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-500 text-black font-bold">
                  2
                </span>
                Signers and confirmations
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Set the signers of your VaultX Wallet and how many need
                to confirm to execute a valid transaction.
              </p>
            </div>

            {/* Signers list */}
            <div className="space-y-6">
              {signers.map((signer, index) => (
                <div key={index} className="flex items-center gap-3 mb-4">
                  {/* Signer Name */}
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Signer name</label>
                    <input
                      type="text"
                      value={signer.name}
                      onChange={(e) =>
                        handleSignerChange(index, "name", e.target.value)
                      }
                      className="w-full bg-black border border-neutral-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder={`Signer ${index + 1}`}
                      disabled={index === 0} // first signer is connected wallet
                    />
                    {index === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Your connected account
                      </p>
                    )}
                  </div>

                  {/* Signer Address */}
                  <div
                    className={`flex-1 ${index !== 0 ? "mb-0" : "mb-5 mr-8"}`}
                  >
                    <label className="block text-sm mb-1">Signer</label>
                    <div className="flex items-center gap-2 bg-black border border-neutral-700 rounded-md p-3">
                      <Blockies
                        seed={(signer.address || "").toLowerCase()}
                        size={8}
                        scale={3}
                        className="rounded-full flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={signer.address}
                        onChange={(e) =>
                          handleSignerChange(index, "address", e.target.value)
                        }
                        placeholder="0x... (enter signer address)"
                        className="bg-transparent flex-1 truncate text-white outline-none"
                        disabled={index === 0}
                      />
                    </div>
                  </div>

                  {/* Delete Button (only for extra signers) */}
                  {index !== 0 && (
                    <div className="flex items-center  mt-5 justify-center">
                      <button
                        onClick={() => removeSigner(index)}
                        className="text-gray-400 justify-center items-center hover:text-red-500 flex-shrink-0"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add new signer */}
              <button
                type="button"
                onClick={addSigner}
                className="text-green-400 hover:text-green-300 font-medium inline-flex items-center gap-2"
              >
                <span className="text-xl leading-none">+</span> Add new signer
              </button>
            </div>

            {/* Threshold + Timelock */}
            <div className="border-t border-neutral-800 pt-6 space-y-6">
              <div>
                <p className="text-lg font-semibold">Threshold</p>
                <p className="text-sm text-gray-400">
                  Any transaction requires the confirmation of:
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="bg-black border border-neutral-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    {Array.from(
                      { length: signers.length },
                      (_, i) => i + 1
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-300">
                    out of {signers.length} signer
                    {signers.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* NEW: Timelock (seconds) */}
              <div>
                <label className="block text-sm mb-2">Timelock (seconds)</label>
                <input
                  type="number"
                  min={0}
                  value={timelock}
                  onChange={(e) => setTimelock(Number(e.target.value))}
                  className="w-full bg-black border border-neutral-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="0 (no timelock)"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 rounded-md border border-green-400 text-green-400 hover:bg-green-500 hover:text-black transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)} // placeholder next
                className="px-6 py-2 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Review & Deploy */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Header */}
            <p className="text-lg font-semibold flex items-center gap-2">
              <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-500 text-black font-bold">
                3
              </span>
              Review & deploy
            </p>

            {/* Review Card */}
            <div className="bg-neutral-900 rounded-xl shadow-lg p-6 space-y-4">
              {/* Network */}
              <div className="flex justify-between">
                <span className="text-gray-400">Network</span>
                <span className="font-medium">Sepolia</span>
              </div>

              {/* Name */}
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{name}</span>
              </div>

              {/* Signers */}
              <div>
                <span className="text-gray-400 block mb-2">Signers</span>
                <div className="space-y-2">
                  {signers.map((signer, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-neutral-800 rounded-md px-3 py-2"
                    >
                      <Blockies
                        seed={signer.address.toLowerCase()}
                        size={8}
                        scale={3}
                        className="rounded-full"
                      />
                      <span className="font-mono text-sm">
                        {signer.address.slice(0, 6)}...
                        {signer.address.slice(-4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threshold */}
              <div className="flex justify-between">
                <span className="text-gray-400">Threshold</span>
                <span className="font-medium">
                  {threshold} out of {signers.length} signers
                </span>
              </div>

              {/* Timelock */}
              <div className="flex justify-between">
                <span className="text-gray-400">Timelock</span>
                <span className="font-medium">{timelock} seconds</span>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 rounded-md border border-green-400 text-green-400 hover:bg-green-500 hover:text-black transition"
              >
                Back
              </button>
              <button
                onClick={handleCreateWallet}
                className="px-6 py-2 rounded-md bg-green-400 text-black font-semibold hover:bg-green-500 transition"
              >
                Create wallet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Section (Preview) — unchanged */}
      <div className="flex-1 mt-10 lg:mt-0 lg:ml-8">
        <div className="bg-neutral-900 rounded-xl shadow-lg p-6 md:p-10 w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <img
              src={VaultXLogo}
              alt="VaultX"
              className="h-10 w-10 object-contain"
            />
            <p className="text-xl font-semibold">VaultX</p>
          </div>

          <h2 className="text-lg font-bold mb-4">
            Your VaultX Wallet preview
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Wallet</span>
              <div className="flex items-center gap-2">
                <Blockies
                  seed={(address || "0x0").toLowerCase()}
                  size={8}
                  scale={3}
                  className="rounded-full"
                />
                <span className="font-mono">{formatAddress(address)}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network</span>
              <span>Sepolia</span>
            </div>
          </div>
        </div>
      </div>
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
              open={isModalOpen}
              onClose={() =>{
                setIsModalOpen(false);
                navigate(`/wallet-page/${walletAddress}`);

              } }
              onConfirm={() => {
                setIsModalOpen(false);
                navigate(`/wallet-page/${walletAddress}`);

                
              }}
              title="Success"
              body="Wallet created successfully!"
            />
    </div>
    
  );
};

export default CreateWallet;
