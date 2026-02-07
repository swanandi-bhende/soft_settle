// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NitroliteCore {
    // Minimal stub of NitroliteCore expected by SoftSettleChannel.
    // This provides the `closeSessionMutual` hook used by the child contract.
    function closeSessionMutual(address /*consumer*/, uint256 /*finalTransferred*/) internal virtual {
        // intentionally empty
    }
}
