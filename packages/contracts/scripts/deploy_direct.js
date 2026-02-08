import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet, ContractFactory, Contract } from 'ethers';

dotenv.config();

async function main() {
  const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org');
  const signer = new Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

  console.log('Deploying with', signer.address);

  const artifactsDir = path.resolve(process.cwd(), 'artifacts', 'contracts');

  const repJson = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'ReputationManager.sol', 'ReputationManager.json'), 'utf8'));
  const channelJson = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'SoftSettleChannel.sol', 'SoftSettleChannel.json'), 'utf8'));

  const repFactory = new ContractFactory(repJson.abi, repJson.bytecode, signer);
  const SEPOLIA_ENS_RESOLVER = (process.env.SEPOLIA_ENS_RESOLVER || '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5').toLowerCase();
  const repDeployTx = await repFactory.getDeployTransaction(SEPOLIA_ENS_RESOLVER);
  const repSent = await signer.sendTransaction(repDeployTx);
  const repReceipt = await repSent.wait();
  const repAddress = repReceipt.contractAddress;
  if (!repAddress) throw new Error('Failed to get ReputationManager address from receipt');
  const reputationManager = new Contract(repAddress, repJson.abi, signer);
  console.log('ReputationManager deployed to', repAddress);

  const usdc = (process.env.SEPOLIA_USDC || '0x1c7D4B196Cb0C7B01d743FBC6116a902379C7238').toLowerCase();
  const channelFactory = new ContractFactory(channelJson.abi, channelJson.bytecode, signer);
  const chanDeployTx = await channelFactory.getDeployTransaction(usdc, repAddress);
  const chanSent = await signer.sendTransaction(chanDeployTx);
  const chanReceipt = await chanSent.wait();
  const channelAddress = chanReceipt.contractAddress;
  if (!channelAddress) throw new Error('Failed to get SoftSettleChannel address from receipt');
  const softSettleChannel = new Contract(channelAddress, channelJson.abi, signer);
  console.log('SoftSettleChannel deployed to', channelAddress);

  const tx = await reputationManager.setChannel(channelAddress);
  await tx.wait();
  console.log('Authorized channel on ReputationManager');
}

main().catch((err) => { console.error(err); process.exit(1); });
