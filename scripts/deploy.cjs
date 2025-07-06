const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("MultiSigFactory");
  const factory = await Factory.deploy();
  await factory.deployed();

  console.log("MultiSigFactory deployed to:", factory.address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
