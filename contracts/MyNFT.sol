// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract MyNFT is ERC721 {
    address public marketPlaceAddress;
    address public owner;
    constructor() ERC721("MyNFT", "MNFT") {
        owner = msg.sender;
    } 

    function safeMint(address to, uint _tokenId) public onlyMarketPlace {
        _safeMint(to, _tokenId);
    }
    function setMarketPlaceAddress(address _add) public onlyOwner {
        marketPlaceAddress = _add;
    }

    modifier onlyMarketPlace(){
        require( msg.sender == marketPlaceAddress,"Only Market Place");
        _;
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "Only Owner");
        _;
    }
}