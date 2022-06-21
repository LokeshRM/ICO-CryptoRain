//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ICryptoRainNFT {
    function balanceOf(address) external view returns (uint256);

    function tokenOfOwnerByIndex(address, uint256)
        external
        view
        returns (uint256);
}

contract ICO is Ownable, ERC20 {
    uint256 constant maxTokenSupply = 10000 * 10**18;

    uint256 constant nftClaim = 10 * 10**18;

    uint256 constant tokenPrice = 0.001 ether;

    mapping(uint256 => bool) public claimed;

    ICryptoRainNFT cryptoRainNFT;

    constructor(address _nftAddress) ERC20("Crypto Rain Token", "CRT") {
        cryptoRainNFT = ICryptoRainNFT(_nftAddress);
    }

    function claim() public {
        require(
            cryptoRainNFT.balanceOf(msg.sender) > 0,
            "you dont have nft tokens to redeem"
        );
        require(totalSupply() < maxTokenSupply, "tokens are limited");
        uint256 balance = cryptoRainNFT.balanceOf(msg.sender);
        uint256 amount;
        for (uint256 i; i < balance; i++) {
            uint256 _tokenId = cryptoRainNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (!claimed[_tokenId]) {
                claimed[_tokenId] = true;
                amount++;
            }
        }
        require(amount > 0, "you have claimed all nfts rewards");
        _mint(msg.sender, nftClaim * amount);
    }

    function mintToken(uint256 _tokens) external payable {
        require(msg.value >= tokenPrice * _tokens, "not enough ether");
        uint256 tokenstobeMint = _tokens * 10**18;
        require(
            totalSupply() + tokenstobeMint < maxTokenSupply,
            "tokens are limited"
        );
        _mint(msg.sender, tokenstobeMint);
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}

    fallback() external payable {}
}
