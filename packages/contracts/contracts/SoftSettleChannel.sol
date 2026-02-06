// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@erc7824/nitrolite/contracts/NitroliteCore.sol";

interface IReputationManager {
    function updateReputation(
        address consumerNode,
        bool successful,
        uint256 transferred
    ) external;
}

contract SoftSettleChannel is NitroliteCore {
    IERC20 public usdc;
    IReputationManager public reputationManager;

    event SessionClosed(
        address indexed consumerNode,
        bool successful,
        uint256 transferred
    );

    // 🔔 Emitted when on-chain balance is insufficient and
    // off-chain (Circle) settlement is required
    event DeficitDetected(uint256 deficit);

    constructor(address _usdc, address _reputationManager) {
        usdc = IERC20(_usdc);
        reputationManager = IReputationManager(_reputationManager);
    }

    // Logic to lock USDC as collateral for the micro-credit line
    function depositCollateral(uint256 amount) external {
        usdc.transferFrom(msg.sender, address(this), amount);
    }

    /**
     * @dev Called when both parties mutually close the session
     */
    function closeSessionMutual(
        address consumerNode,
        uint256 finalTransferred
    ) internal override {
        // ---- Nitrolite settlement logic ----
        super.closeSessionMutual(consumerNode, finalTransferred);

        // ---- deficit detection (Circle payout trigger) ----
        uint256 balance = usdc.balanceOf(address(this));
        if (finalTransferred > balance) {
            uint256 deficit = finalTransferred - balance;
            emit DeficitDetected(deficit);
        }

        // ---- reputation update ----
        reputationManager.updateReputation(
            consumerNode,
            true,
            finalTransferred
        );

        // ---- event ----
        emit SessionClosed(consumerNode, true, finalTransferred);
    }
}
