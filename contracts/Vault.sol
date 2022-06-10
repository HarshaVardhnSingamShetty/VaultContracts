// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RewardToken.sol";
import "./VToken.sol";

contract Vault {
    VToken vTokencontract;
    RewardToken rewardContract;
    bool locked = false;
    mapping(address => uint) public tokenBalance;
    mapping(address => uint) public rewardBalance;
    constructor(address _tokenAddress, address _rewardTokenAddress) {
        
        require( _tokenAddress != address(0), "Invalid Vault Token Address" ); 
        require( _rewardTokenAddress != address(0), "Invalid Reward Token Address" );        
        vTokencontract = VToken(_tokenAddress);
        rewardContract = RewardToken(_rewardTokenAddress);
        vTokencontract.totalSupply();
    }
    modifier isLocked(){
        require(locked==false, "LOCKED!");
        locked = true;
        _;
        locked = false;
    }
    function deposit(uint amount) external isLocked {
        require( amount > 0, "INSUFFICIENT AMOUNT" );
        tokenBalance[msg.sender]+=amount; 
        vTokencontract.transferFrom(msg.sender, address(this), amount);
        rewardBalance[msg.sender]+=amount;
        rewardContract.generateReward(msg.sender, amount);

    }
    function withdraw(uint amount) external isLocked {
        require( amount > 0, "INSUFFICIENT AMOUNT" );
        uint userBalance = tokenBalance[msg.sender];
        require( userBalance >= amount, "Insufficient tokens");
        tokenBalance[msg.sender]-=amount;
        vTokencontract.transfer(msg.sender, amount);
        rewardBalance[msg.sender]-=amount;
        rewardContract.burnReward(msg.sender, amount); 
    }
}