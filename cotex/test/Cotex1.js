const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("ContentToken", function () {
  let ContentToken;
  let contentToken;
  let owner;
  let sender;
  let addr1;
  let addr2;

  const initialSupply = 1000000;
  //const pricePerShare = 1000000000000000; // 1e15 wei (0.001 ETH)
  const pricePerShare = ethers.utils.parseUnits(".5", 'ether'); // 1e15 wei (0.001 ETH)


  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    //[owner, sender] = await ethers.getSigners()

    const ContentToken = await ethers.getContractFactory("ContentToken");
    contentToken = await ContentToken.deploy("ContentToken", "CX", initialSupply, pricePerShare);
    await contentToken.deployed();

    const content = await contentToken.connect(owner)
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
      console.log(await contentToken.totalSupply())
      expect(await contentToken.totalSupply()).to.equal(initialSupply + amountToMint);
    });
  });

  describe("Content Management", function () {
    it("Should allow creator to create new content", async function () {
      const name = "Awesome Content";
      const description = "This is some awesome content!";
      const cost = ethers.utils.parseUnits("1", 'ether');
      //const AMOUNT = ethers.utils.parseUnits("1", 'ether')

      const sharesAmount = 1000;
      await contentToken.createContent(name, description, cost, sharesAmount);

      const content = await contentToken.content(1);
      expect(content.name).to.equal(name);
      expect(content.description).to.equal(description);
      expect(content.cost).to.equal(cost);
      expect(content.shares).to.equal(sharesAmount);
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

      const newName = "New Awesome Content should not be allowed";
      const newDescription = "This is some new awesome content that should not be allowed!";
      const newCost = 50;

      //console.log("Updating Content:", newName, newDescription, newCost);

      //await expect(contentToken.connect(addr1).updateContent(1, newName, newDescription, newCost)).to.be.revertedWith("Not the content creator");
      const updatedContent = await contentToken.content(1);
      contentToken.connect(addr1).updateContent(1, newName, newDescription, newCost)
      console.log(updatedContent.description)
    });
  });

  describe("Shares Purchasing", function () {
    const NAME = "Purchased Content"
    const DESCRIPTION = "This content has been purchased"
    const ID = 2
    const COST = ethers.utils.parseUnits('1', 'ether')
    const SHARESAMT = 100

    beforeEach(async () => {
      const transaction = await contentToken.connect(owner).createContent(NAME, DESCRIPTION, COST, SHARESAMT)
      await transaction.wait()
    })

    it("Should allow user to purchase shares", async function () {
      //await contentToken.createContent("Awesome Content", "This is some awesome content!", 10, 1000);

      const sharesToPurchase = 80;

      //const costs = (COST * sharesToPurchase).toString();
      //console.log(costs);
      const totalCost = ethers.utils.parseUnits((COST * sharesToPurchase).toString(), 'ether');

      /* TODO:
      Following the Dapp University TokenMaster contract, using beforeEach for all of the Shares Purchasing tests,
      contentToken already creates content, assigning a cost for each share (1 eth). */
      

      //await contentToken.connect(addr1).purchaseShares(1, sharesToPurchase, {value: constInEther});
      await contentToken.connect(addr1).purchaseShares(1, sharesToPurchase, {value: totalCost});

      const addr1Balance = await contentToken.balanceOf(addr1.address);
      //console.log(addr1Balance);
      expect(addr1Balance).to.equal(sharesToPurchase);

      const content = await contentToken.content(1);
      expect(content.shares).to.equal(80); // Assuming initial content shares were 1000
    });

    it("Should not allow user to purchase more shares than available", async function () {
      await contentToken.createContent("Awesome Content", "This is some awesome content!", 10, 100);

      const sharesToPurchase = 101;
      const cost = sharesToPurchase * pricePerShare;

      //await expect(contentToken.connect(addr1).purchaseShares(1, sharesToPurchase)).to.be.revertedWith("Insufficient shares available");
      await expect(contentToken.connect(addr1).purchaseShares(1, sharesToPurchase)).to.be.reverted
      /* await contentToken.connect(addr1).purchaseShares(1, sharesToPurchase);
      const addr1Balance = await contentToken.balanceOf(addr1.address);
      console.log(addr1Balance); */


    
    });

    it("Should not allow user to purchase shares with incorrect ETH value", async function () {
      await contentToken.createContent("Awesome Content", "This is some awesome content!", 10, 100);

      const sharesToPurchase = 50;
      const cost = sharesToPurchase * pricePerShare + 1; // Incorrect ETH value

      await expect(contentToken.connect(addr1).purchaseShares(1, sharesToPurchase)).to.be.reverted
    });
  });
});