// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NitroliteCore.sol";

interface IReputationManager {
    function processSettlement(bytes32 node, bool success) external;
}

contract SoftSettleChannel is NitroliteCore {
    IERC20 public usdc;
    IReputationManager public reputationManager;

    struct Session {
        address consumer;
        bytes32 ensNode; // The namehash of the agent's ENS name
        uint256 balance;
        bool active;
    }

    mapping(bytes32 => Session) public sessions;

    event SessionClosed(bytes32 indexed sessionId, bool successful, uint256 transferred);
    event DeficitDetected(address indexed consumer, uint256 deficit);

    constructor(address _usdc, address _reputationManager) {
        usdc = IERC20(_usdc);
        reputationManager = IReputationManager(_reputationManager);
    }

    function openSession(bytes32 sessionId, address consumer, bytes32 ensNode, uint256 deposit) external {
        // In production, NitroliteCore logic would handle the actual USDC lock logic
        sessions[sessionId] = Session({
            consumer: consumer,
            ensNode: ensNode,
            balance: deposit,
            active: true
        });
        emit SessionStarted(sessionId, consumer, deposit);
    }

    function closeSessionMutual(bytes32 sessionId, uint256 finalTransferred) external {
        Session storage session = sessions[sessionId];
        require(session.active, "Session inactive");

        uint256 availableBalance = usdc.balanceOf(address(this));
        bool successful = true;

        if (finalTransferred > availableBalance) {
            emit DeficitDetected(session.consumer, finalTransferred - availableBalance);
            successful = false;
        }

        // Trigger Reputation Update
        reputationManager.processSettlement(session.ensNode, successful);

        session.active = false;
        emit SessionClosed(sessionId, successful, finalTransferred);
        
        super._closeSessionMutual(session.consumer, finalTransferred);
    }
}