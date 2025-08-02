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
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});