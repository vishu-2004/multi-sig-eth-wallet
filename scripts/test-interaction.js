require('dotenv').config(); // Load environment variables from .env file
const { ethers } = require("hardhat");

async function main() {
    // Check if contract address exists in .env, otherwise deploy a new contract
    let factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" ;

    const accounts = await ethers.getSigners();
    const [owner1, owner2, owner3] = accounts;

    let factory;

    // If no address is found in .env, deploy a new contract and save the address
    if (!factoryAddress) {
        console.log("Deploying new contract...");
        const MultiSigFactory = await ethers.getContractFactory("MultiSigFactory");
        factory = await MultiSigFactory.deploy();
        await factory.deployed();
        console.log("MultiSigFactory deployed at:", factory.address);

        

    } else {
        // If contract address exists, attach to the deployed contract
        console.log("Using existing contract at:", factoryAddress);
        factory = await ethers.getContractAt("MultiSigFactory", factoryAddress);
    }

    // Create a new wallet through the factory
    const owners = [owner1.address, owner2.address, owner3.address];
    const tx = await factory.createWallet(owners, 2, 0);
    const receipt = await tx.wait();

    const walletCreatedEvent = factory.interface.parseLog(
        receipt.logs.find(log =>
            log.topics[0] === factory.interface.getEvent('WalletCreated').topicHash
        )
    );

    const walletAddress = walletCreatedEvent.args.walletAddress;
    const wallet = await ethers.getContractAt("MultiSigWallet", walletAddress);
    const walletWithSigner1 = wallet.connect(owner1);
    const walletWithSigner2 = wallet.connect(owner2);
    const walletWithSigner3 = wallet.connect(owner3);

    // Add some Ether to the wallet for transactions
    await accounts[0].sendTransaction({
        to: walletAddress,
        value: ethers.parseEther("10"),
    });

    // Submit some transactions
    const submitTx1 = await walletWithSigner1.submitTransaction(owners[1], ethers.parseEther("0.1"), "0x");
    await submitTx1.wait();
    const submitTx2 = await walletWithSigner2.submitTransaction(owners[2], ethers.parseEther("0.8"), "0x");
    await submitTx2.wait();
    const submitTx3 = await walletWithSigner3.submitTransaction(owners[0], ethers.parseEther("1"), "0x");
    await submitTx3.wait();

    // Approve and execute transactions
    const approveTx1by2 = await walletWithSigner2.approveTransaction(0);
    await approveTx1by2.wait();
    const approveTx1by1 = await walletWithSigner1.approveTransaction(0);
    await approveTx1by1.wait();
    const revokeTx1by2 = await walletWithSigner2.revokeApproval(0);
    await revokeTx1by2.wait();
    const approveTx1by3 = await walletWithSigner3.approveTransaction(0);
    await approveTx1by3.wait();

    const executeTx = await walletWithSigner2.executeTransaction(0);
    await executeTx.wait();

    const approveTx2by1 = await walletWithSigner1.approveTransaction(1);
    await approveTx2by1.wait();

    console.log("Script completed successfully.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
