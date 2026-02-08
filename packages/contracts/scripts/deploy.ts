import hre from "hardhat";

async function main() {
  const anyHre: any = hre as any;
  const [deployer] = await anyHre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Sepolia addresses
  const SEPOLIA_ENS_RESOLVER =
    "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";
  const SEPOLIA_USDC =
    "0x1c7D4B196Cb0C7B01d743FBC6116a902379C7238";

  // 1. Deploy ReputationManager
  const ReputationFactory = await anyHre.ethers.getContractFactory("ReputationManager");
  const reputationManager = await ReputationFactory.connect(deployer).deploy(SEPOLIA_ENS_RESOLVER);
  await reputationManager.deployed();

  console.log("ReputationManager deployed to:", reputationManager.address);

  // 2. Deploy SoftSettleChannel
  const ChannelFactory = await anyHre.ethers.getContractFactory("SoftSettleChannel");
  const softSettleChannel = await ChannelFactory.connect(deployer).deploy(SEPOLIA_USDC, reputationManager.address);
  await softSettleChannel.deployed();

  console.log("SoftSettleChannel deployed to:", softSettleChannel.address);

  // 3. Authorize channel
  console.log("Authorizing channel...");
  const tx = await reputationManager.connect(deployer).setChannel(softSettleChannel.address);
  await tx.wait();

  console.log("Setup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
