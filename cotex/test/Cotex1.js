const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("ContentToken", function () {
  let ContentToken;
  let contentToken;
  let owner;
  let addr1;
  let addr2;

  const initialSupply = 1000000;
  const pricePerShare = 1000000000000000; // 1e15 wei (0.001 ETH)

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    ContentToken = await ethers.getContractFactory("Cotex1");
    contentToken = await ContentToken.deploy("Cotex1", "CX", initialSupply, pricePerShare);
    //await contentToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contentToken.owner()).to.equal(owner.address);
    });

    it("Should set the initial supply", async function () {
      expect(await contentToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should set the correct price per share", async function () {
      expect(await contentToken.pricePerShare()).to.equal(pricePerShare);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new shares", async function () {
      const amountToMint = 1000;
      await contentToken.connect(owner).mintShares(amountToMint);
      expect(await contentToken.totalSupply()).to.equal(initialSupply + amountToMint);
    });
  });

  describe("Content Management", function () {
    it("Should allow creator to create new content", async function () {
      const name = "Awesome Content";
      const description = "This is some awesome content!";
      const cost = 10;
      const sharesAmount = 1000;

      await contentToken.createContent(name, description, cost, sharesAmount);

      const content = await contentToken.content(1);
      expect(content.name).to.equal(name);
      expect(content.description).to.equal(description);
      expect(content.cost).to.equal(cost);
      expect(content.shares).to.equal(sharesAmount);
      expect(content.sharesAmount).to.equal(sharesAmount);
      expect(content.creator).to.equal(owner.address);
      expect(content.createdTimestamp).to.not.equal(0);
      expect(content.updatedTimestamp).to.not.equal(0);
    });

    it("Should allow creator to update content", async function () {
      await contentToken.createContent("Old Name", "Old Description", 10, 1000);

      const newName = "New Awesome Content";
      const newDescription = "This is some new awesome content!";
      const newCost = 20;

      await contentToken.connect(owner).updateContent(1, newName, newDescription, newCost);

      const updatedContent = await contentToken.content(1);
      expect(updatedContent.name).to.equal(newName);
      expect(updatedContent.description).to.equal(newDescription);
      expect(updatedContent.cost).to.equal(newCost);
      expect(updatedContent.updatedTimestamp).to.not.equal(0);
    });

    it("Should not allow non-creator to update content", async function () {
      await contentToken.createContent("Old Name", "Old Description", 10, 1000);

      const newName = "New Awesome Content";
      const newDescription = "This is some new awesome content!";
      const newCost = 20;

      await expect(contentToken.connect(addr1).updateContent(1, newName, newDescription, newCost)).to.be.revertedWith("Not the content creator");
    });
  });

  describe("Shares Purchasing", function () {
    it("Should allow user to purchase shares", async function () {
      await contentToken.createContent("Awesome Content", "This is some awesome content!", 10, 1000);

      const sharesToPurchase = 100;
      const cost = sharesToPurchase * pricePerShare;

      await contentToken.connect(addr1).purchaseShares(1, sharesToPurchase, { value: cost });

      const addr1Balance = await contentToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(sharesToPurchase);

      const content = await contentToken.content(1);
      expect(content.shares).to.equal(900); // Assuming initial content shares were 1000
      expect(content.sharesAmount).to.equal(900); // Assuming initial content shares were 1000
    });

    it("Should not allow user to purchase more shares than available", async function () {
      await contentToken.createContent("Awesome Content", "This is some awesome content!", 10, 100);

      const sharesToPurchase = 200;
      const cost = sharesToPurchase * pricePerShare;

      await expect(contentToken.connect(addr1).purchaseShares(1, sharesToPurchase, { value: cost })).to.be.revertedWith("Insufficient shares available");
    });

    it("Should not allow user to purchase shares with incorrect ETH value", async function () {
      await contentToken.createContent("Awesome Content", "This is some awesome content!", 10, 100);

      const sharesToPurchase = 50;
      const cost = sharesToPurchase * pricePerShare + 1; // Incorrect ETH value

      await expect(contentToken.connect(addr1).purchaseShares(1, sharesToPurchase, { value: cost })).to.be.revertedWith("Incorrect ETH value");
    });
  });
});
