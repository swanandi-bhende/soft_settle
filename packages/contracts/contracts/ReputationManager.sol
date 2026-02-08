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

    function processSettlement(bytes32 node, bool success) external {
        require(msg.sender == authorizedChannel, "Unauthorized");

        string memory key = "vnd.soft-settle.score";
        string memory currentScoreStr = ensResolver.text(node, key);
        uint256 currentScore = bytes(currentScoreStr).length == 0 ? 500 : _parseUint(currentScoreStr);
        
        uint256 newScore = success ? currentScore + 10 : (currentScore > 50 ? currentScore - 50 : 0);
        
        ensResolver.setText(node, key, _uintToStr(newScore));
        emit ReputationUpdated(node, newScore);
    }

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

    function _uintToStr(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            bstr[k] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }
}