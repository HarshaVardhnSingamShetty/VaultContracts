// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract VToken is ERC20 {
    
    address public admin ;
    constructor() ERC20("VToken", "VT") {
        admin = msg.sender;
        _mint(msg.sender, 100000000000000000000000000);
    }
    
}
   