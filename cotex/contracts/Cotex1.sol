// Copyright (c) 2023 Jaeden Hero
// All rights reserved.
/**
 * @title COTEX (Content Ownership Token Exchange) Smart Contract
 * @author Jaeden Hero <jd.hero@live.com>
 * @dev COTEX is a decentralized platform for tokenizing ownership of online content.
 *
 * @notice COTEX allows content creators to mint ownership shares of their digital content,
 * which are represented as fungible ERC-20 tokens on the Ethereum blockchain. Users can
 * buy, sell, and trade these ownership shares in a decentralized marketplace, creating
 * a dynamic ecosystem for the exchange of ownership in popular digital content.
 *
 * @dev This smart contract includes features for minting content, setting dynamic pricing,
 * managing metadata, withdrawing funds, deactivating content, and more.
 *
 */


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";


contract ContentToken is ERC20 {

    address public owner;

    using Math for uint256;
    uint256 public totalContents;

    struct Content {
        uint256 id;
        string name;
        string description;
        uint256 cost;
        uint256 shares;
        address creator;
        uint256 createdTimestamp;
        uint256 updatedTimestamp;
    }

    mapping(uint256 => Content) public content;
    mapping(uint256 => address) public contentOwners;

     modifier onlyOwner() {
        require(msg.sender == owner);
        _;

     }

    event ContentCreated(uint256 contentId, address creator);
    event ContentPurchased(uint256 contentId, address buyer, uint256 sharesAmount);

    uint256 public pricePerShare; // In wei

    address public contentOwner;

    uint256 public totalShares;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint256 _pricePerShare
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
        pricePerShare = _pricePerShare;
        owner = msg.sender;
        totalShares = _initialSupply;

    }

    function mintShares(uint256 _amount) external onlyOwner {
        _mint(msg.sender, _amount);
    }

    function setPricePerShare(uint256 _newPrice) external onlyOwner {
        pricePerShare = _newPrice;
    }

    function createContent(
        string memory _name,
        string memory _description,
        uint256 _cost,
        uint256 _sharesAmount
    ) external onlyOwner {
        totalContents++;
        content[totalContents] = Content(
            /* id: newContentId,
            name: _name,
            description: _description,
            cost: _cost,
            shares: _sharesAmount,
            sharesAmount: _sharesAmount,
            creator: msg.sender,
            createdTimestamp: block.timestamp,
            updatedTimestamp: block.timestamp */
            totalContents,
            _name,
            _description,
            _cost,
            _sharesAmount,
            msg.sender,
            block.timestamp,
            block.timestamp
        );
    

        //emit ContentCreated(newContentId, msg.sender);
    }

    function updateContent(
        uint256 contentId,
        string memory _name,
        string memory _description,
        uint256 _cost
    ) external onlyOwner {
        
        require(msg.sender == content[contentId].creator, "Not the content creator");

        Content storage currentContent = content[contentId];
        currentContent.name = _name;
        currentContent.description = _description;
        currentContent.cost = _cost;
        currentContent.updatedTimestamp = block.timestamp;
    }

    function purchaseShares(uint256 contentId, uint256 _sharesAmount) public payable {
        require(_sharesAmount > 0, "Shares amount must be greater than zero");
        //require(msg.value == _sharesAmount * pricePerShare, "Incorrect ETH value");
        require(msg.value >= content[contentId].cost);
        require(totalShares >= _sharesAmount, "Insufficient shares available");
        
        uint256 totalCost = (content[contentId].cost) * _sharesAmount;

        // Transfer Ether from the buyer to the contract owner
        payable(owner).transfer(totalCost);

        // Transfer existing ownership shares from the contract owner to the buyer
        _transfer(owner, msg.sender, _sharesAmount);

        // Update ownership details
        contentOwners[contentId] = msg.sender;
        content[contentId].shares -= _sharesAmount;

        emit ContentPurchased(contentId, msg.sender, _sharesAmount);
    }



    receive() external payable {
        // Fallback function to receive ETH




    }
}