// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {
    
    address public admin;
    address public vaultAddress;
    constructor() ERC20("RewardToken", "RT") {
        admin = msg.sender;
    }

    function generateReward(address to, uint amount) onlyVault external  {
        _mint(to, amount);

    }
    function burnReward(address owner, uint amount) onlyVault external{
        _burn(owner, amount);

    }
    function setVaultAddress(address _vaultAddress) onlyAdmin external{
        vaultAddress = _vaultAddress;
    }
    modifier onlyAdmin(){
        require(msg.sender == admin, "ONLY ADMIN");
        _;
    }
    modifier onlyVault(){
        require(msg.sender == vaultAddress, "ONLY VAULT Contract");
        _;
    }
    
}
  