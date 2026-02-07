// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NitroliteCore.sol";

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

    struct Session {
        address consumer;
        uint256 balance;
        bool active;
    }

    mapping(bytes32 => Session) public sessions;

    // Events
    event SessionClosed(bytes32 indexed sessionId, bool successful, uint256 transferred);
    event DeficitDetected(address indexed consumer, uint256 deficit);

    constructor(address _usdc, address _reputationManager) {
        usdc = IERC20(_usdc);
        reputationManager = IReputationManager(_reputationManager);
    }

    /// @notice Deposit USDC as collateral
    function depositCollateral(uint256 amount) external {
        usdc.transferFrom(msg.sender, address(this), amount);
    }

    /// @notice Open a session (optional helper)
    function openSession(bytes32 sessionId, address consumer, uint256 deposit) external {
        sessions[sessionId] = Session({
            consumer: consumer,
            balance: deposit,
            active: true
        });
    }

    /**
     * @notice Called when both parties mutually close the session
     * @param sessionId Unique session identifier
     * @param finalTransferred Amount settled at the end of session
     */
    function closeSessionMutual(
        bytes32 sessionId,
        uint256 finalTransferred
    ) external {
        Session storage session = sessions[sessionId];
        require(session.active, "Session inactive");

        uint256 balance = usdc.balanceOf(address(this));
        bool successful = true;

        // Deficit detection
        if (finalTransferred > balance) {
            uint256 deficit = finalTransferred - balance;
            emit DeficitDetected(session.consumer, deficit);
            successful = false;
        }

        // Update reputation
        reputationManager.updateReputation(session.consumer, successful, finalTransferred);

        // Mark session closed
        session.active = false;

        // Emit session closed event
        emit SessionClosed(sessionId, successful, finalTransferred);

        // Call parent NitroliteCore logic
        super.closeSessionMutual(session.consumer, finalTransferred);
    }
}
