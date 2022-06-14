// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "hardhat/console.sol";


contract MyNFT is IERC721, ERC721 {
    using Counters for Counters.Counter;
    IERC20 tokenContract;
    uint256 private mintingCost = 100;
    Counters.Counter private _tokenIdCounter;
    // TokenID to Cost mapping
    mapping ( uint => uint) public onSaleCost;
    mapping (uint => address) public onSaleNFTOwner;

    constructor(address _tokenAddress) ERC721("MyNFT", "MNFT") {
        tokenContract = IERC20(_tokenAddress);

    }
    modifier validTokenID(uint _tokenId){
        require(_exists(_tokenId), "Invalid Token ID");
        _;
    }

    function mintNFT(address to) public  {
        require( to != address(0), "Invalid to address");
        //need approval of mintingCost by caller to this contract
        tokenContract.transferFrom( msg.sender, address(this), mintingCost);
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function  putNFTonSale(uint _tokenId, uint cost) external validTokenID(_tokenId) {
        //before putting on Sale, the owner should approve the tokenID to the contract, to be able to make the sale
        address owner = ownerOf(_tokenId);
        require( owner == msg.sender, "Only Owner");
        require( cost > 0, "Cost must be > 0" );
        onSaleCost[_tokenId] = cost ;
        onSaleNFTOwner[_tokenId] = msg.sender;

        safeTransferFrom(owner, address(this), _tokenId);
    }
    function removeNFTfromSale(uint _tokenId) external validTokenID(_tokenId){
        address owner = onSaleNFTOwner[_tokenId];
        require( owner == msg.sender, "NFT not on Sale or Sender is not the Owner");
        onSaleCost[_tokenId] = 0;
        onSaleNFTOwner[_tokenId] = address(0);
        IERC721(address(this)).approve(owner, _tokenId);
        safeTransferFrom( address(this), owner,  _tokenId);

    }

    function buyNFT(uint _tokenId) external validTokenID(_tokenId){
        uint cost = onSaleCost[_tokenId];
        require( cost > 0 , "This NFT is not on Sale");
        address owner = onSaleNFTOwner[_tokenId];
        require( owner != msg.sender, "Sender already owns the NFT" );
        
        //the sender must approve this contract the cost of the NFT
        tokenContract.transferFrom(msg.sender, owner, cost );
        
        //taking the NFT off of the sale
        onSaleCost[_tokenId] = 0 ;
        onSaleNFTOwner[_tokenId] = address(0);
        console.log("Before the transfer function:", getApproved(_tokenId), address(this), msg.sender);
        IERC721(address(this)).approve(msg.sender, _tokenId);
        console.log("afer the approve function:", getApproved(_tokenId), address(this), msg.sender);

        safeTransferFrom(address(this), msg.sender, _tokenId);
    }
    function onERC721Received(
            address operator,
            address from,
            uint256 tokenId,
            bytes calldata data
        ) external pure returns (bytes4){
            bytes4 selector = IERC721Receiver.onERC721Received.selector;
            return selector;
        }

}