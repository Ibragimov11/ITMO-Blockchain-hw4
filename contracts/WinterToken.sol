// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SummerToken is ERC20 {
    constructor() ERC20("FirstToken", "WNT") {
        _mint(msg.sender, 50000);
    }
}
