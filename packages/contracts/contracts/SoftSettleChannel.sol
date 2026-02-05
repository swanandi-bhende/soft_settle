// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@erc7824/nitrolite/contracts/NitroliteCore.sol"; 

contract SoftSettleChannel is NitroliteCore {
    IERC20 public usdc;

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    // Logic to lock USDC as collateral for the micro-credit line
    function depositCollateral(uint256 amount) external {
        usdc.transferFrom(msg.sender, address(this), amount);
    }
}