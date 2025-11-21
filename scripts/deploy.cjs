require("dotenv").config(); 
const hre = require("hardhat");

async function main() {
  const isProd = process.env.PROD === "true";
  const network = isProd ? "sepolia" : "localhost";

  console.log(`Deploying to: ${network}`); 

  const Factory = await hre.ethers.getContractFactory("MultiSigFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();

  const contractAddress = await factory.getAddress();

  console.log("MultiSigFactory deployed to:", contractAddress);
  console.log("Tx Hash:", factory.deploymentTransaction().hash);

  if (isProd) {
    console.log("Verifying contract on Etherscan...");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("Verification completed!"); 
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
