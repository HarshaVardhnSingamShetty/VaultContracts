// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {
    
    
    constructor() ERC20("RewardToken", "RT") {
    }

    function generateReward(address to, uint amount) public {
        _mint(to, amount);

    }
    function burnReward(address owner, uint amount) public{
        _burn(owner, amount);

    }


}
  