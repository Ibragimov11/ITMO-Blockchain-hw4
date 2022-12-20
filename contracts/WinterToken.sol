// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WinterToken is ERC20 {
    constructor() ERC20('WinterToken', 'WNT') {
        _mint(msg.sender, 50000);
    }
}
