// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IENSResolver {
    function text(bytes32 node, string calldata key) external view returns (string memory);
    function setText(bytes32 node, string calldata key, string calldata value) external;
}

contract ReputationManager is Ownable {
    IENSResolver public ensResolver;
    address public authorizedChannel;

    event ReputationUpdated(bytes32 indexed node, uint256 newScore);

    constructor(address _ensResolver) Ownable(msg.sender) {
        ensResolver = IENSResolver(_ensResolver);
    }

    function setChannel(address _channel) external onlyOwner {
        authorizedChannel = _channel;
    }

    /**
     * @notice Updates the credit score record on ENS.
     * @param node The ENS namehash of the agent.
     * @param success Whether the micro-credit session settled without deficit.
     */
    function processSettlement(bytes32 node, bool success) external {
        require(msg.sender == authorizedChannel, "Unauthorized");

        // Simple scoring: Start at 500. Success +10, Failure -50.
        string memory currentScoreStr = ensResolver.text(node, "vnd.soft-settle.score");
        uint256 currentScore = _parseUint(currentScoreStr == "" ? "500" : currentScoreStr);
        
        uint256 newScore = success ? currentScore + 10 : (currentScore > 50 ? currentScore - 50 : 0);
        
        ensResolver.setText(node, "vnd.soft-settle.score", _uintToStr(newScore));
        emit ReputationUpdated(node, newScore);
    }

    // Helper: string to uint
    function _parseUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
                result = result * 10 + (uint8(b[i]) - 48);
            }
        }
        return result;
    }

    // Helper: uint to string
    function _uintToStr(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }
}