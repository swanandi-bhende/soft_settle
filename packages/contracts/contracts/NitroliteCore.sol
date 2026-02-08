// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract NitroliteCore {
    event SessionStarted(bytes32 indexed sessionId, address indexed consumer, uint256 deposit);

    // Internal hook to be overridden or called by child contracts
    function _closeSessionMutual(address consumer, uint256 finalTransferred) internal virtual {
        // Core settlement logic would go here
    }
}