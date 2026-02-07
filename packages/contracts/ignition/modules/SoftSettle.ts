import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SoftSettleModule", (m) => {
  // Deploy ReputationManager first (pass zero ENS resolver for now)
  const ZERO = "0x0000000000000000000000000000000000000000";
  const reputationManager = m.contract("ReputationManager", [ZERO]);

  // Deploy SoftSettleChannel with USDC address (zero for now) and deployed ReputationManager
  const softSettle = m.contract("SoftSettleChannel", [ZERO, reputationManager]);

  return { reputationManager, softSettle };
});