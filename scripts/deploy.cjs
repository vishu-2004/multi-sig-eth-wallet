const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("MultiSigFactory");
  const factory = await Factory.deploy();
  
  // Wait for deployment to complete (new syntax)
  await factory.waitForDeployment();
  
  // Get contract address (new syntax)
  const contractAddress = await factory.getAddress();
  
  console.log("MultiSigFactory deployed to:", contractAddress);
  console.log("Transaction hash:", factory.deploymentTransaction().hash);
  const owners = [owner1.address, owner2.address, owner3.address];
    const tx = await factory.createWallet(owners,2,0);
    const receipt = await tx.wait();

    const walletCreatedEvent = factory.interface.parseLog(
        receipt.logs.find(log =>
            log.topics[0] === factory.interface.getEvent('WalletCreated').topicHash
        )
    )
    const walletAddress = walletCreatedEvent.args.walletAddress;
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});