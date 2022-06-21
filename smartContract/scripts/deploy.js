const hre = require("hardhat");

async function main() {
  const ICO = await hre.ethers.getContractFactory("ICO");
  const ico = await ICO.deploy("0xb106e59e8Ee4CC3a989fFaf1c2C8ecf193F62e1A");

  await ico.deployed();

  console.log("ICO deployed to:", ico.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
