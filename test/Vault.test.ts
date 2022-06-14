import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";
import { BigNumber, Signer } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { MarketPlace, MyNFT, RewardToken, Vault, VToken,  } from "../src/types/contracts";
import { Test2 } from "../src/types/contracts/sampleContract.sol";
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.getDefaultProvider();


describe("Vault Contracts", function () {
    let owner: SignerWithAddress;
    let user1: SignerWithAddress ;
    let user2: SignerWithAddress;
    let vaultContract: Vault;
    let vTokenContract: VToken;
    let rewardTokenContract: RewardToken;
    let myNFTContract: MyNFT;
    let test2Contract: Test2;
    let addrs: SignerWithAddress[];
    let marketPlaceContract: MarketPlace;
    
    beforeEach(async ()=>{
        [owner, user1, user2, ...addrs] = await ethers.getSigners();
        const vaultFactory = await ethers.getContractFactory("Vault");
        const vTokenFactory = await ethers.getContractFactory("VToken");
        const rewardTokenFactory = await ethers.getContractFactory("RewardToken");
        const myNFTFactory = await ethers.getContractFactory("MyNFT");
        const marketPlaceFactory = await ethers.getContractFactory("MarketPlace");

        const test2Factory = await ethers.getContractFactory("Test2");

        vTokenContract = (await vTokenFactory.deploy()) as VToken; 
        rewardTokenContract = (await rewardTokenFactory.deploy()) as RewardToken; 
        vaultContract = (await vaultFactory.deploy(vTokenContract.address, rewardTokenContract.address)) as Vault; 
        myNFTContract = (await myNFTFactory.deploy()) as MyNFT; 
        marketPlaceContract = await marketPlaceFactory.deploy(myNFTContract.address, vTokenContract.address) as MarketPlace;
        await myNFTContract.setMarketPlaceAddress(marketPlaceContract.address);
        test2Contract = await test2Factory.deploy() as Test2;
    } )
     describe("Vault", function(){
        it("should set Token address and Reward Token Address", async function(){
                
            expect( await vaultContract.vTokencontract()).to.equal(vTokenContract.address);
            expect( await vaultContract.rewardContract()).to.equal(rewardTokenContract.address);
        })
        describe("deposit feature", async ()=>{
            it("Should have valid VaultToken and rewardToken address", async ()=>{
                const vaultFactory2 = await ethers.getContractFactory("Vault");
                await expect(( vaultFactory2.deploy( ethers.constants.AddressZero , rewardTokenContract.address )) as Vault).to.be.revertedWith("Invalid Vault Token Address") ; 
                await expect(( vaultFactory2.deploy(rewardTokenContract.address,  ethers.constants.AddressZero)) as Vault).to.be.revertedWith("Invalid Reward Token Address") ; 
            });
            it("Should have deposit amt > 0",async ()=>{
                await expect( vaultContract.deposit(0)).to.be.revertedWith("INSUFFICIENT AMOUNT");
            } );
            
            it("Should deposit if amt was approved to Vault contract", async ()=>{
                await vTokenContract.approve(vaultContract.address, 100);
                await rewardTokenContract.setVaultAddress(vaultContract.address);
                await vaultContract.deposit(10);
                expect(await vaultContract.tokenBalance(owner.getAddress())).to.equal(10);
                expect(await vaultContract.rewardBalance(owner.getAddress())).to.equal(10);
           });
            it("Should Not deposit if amt was not approved to Vault contract", async ()=>{
                //await vTokenContract.approve(vaultContract.address, 100);                
                await rewardTokenContract.setVaultAddress(vaultContract.address);
                await expect( vaultContract.deposit(10)).to.be.revertedWith('ERC20: insufficient ');
                
            })

            
        })

        describe("Withdraw feature", ()=>{
            it("Should have withdraw amt > 0",async ()=>{
                await expect( vaultContract.withdraw(0)).to.be.revertedWith("INSUFFICIENT AMOUNT");
            } );

            it("Should revert if Token Balance < Withdraw amount", async ()=>{
                await expect(vaultContract.withdraw(1)).to.be.revertedWith("Insufficient tokens");

            });

            it("Should withdraw amount and burn rewards of specified amount", async ()=>{
                await vTokenContract.approve(vaultContract.address, 100);
                await rewardTokenContract.setVaultAddress(vaultContract.address);
                
                await vaultContract.deposit(100);
                expect(await vaultContract.tokenBalance(owner.getAddress())).to.equal(100);
                expect(await vaultContract.rewardBalance(owner.getAddress())).to.equal(100);
            
                await vaultContract.withdraw(50);
                expect(await vaultContract.tokenBalance(owner.getAddress())).to.equal(50);
                expect(await vaultContract.rewardBalance(owner.getAddress())).to.equal(50);
            

            })

        })



    })
    describe("VToken", function(){
        it("Should set name and total supply", async ()=>{
            expect (await vTokenContract.name()).to.equal("VToken");
            expect( await vTokenContract.totalSupply()).to.equal(BigNumber.from("100000000000000000000000000"));
        });

        it("Should assign total supply to owner of contract", async()=>{
           expect(await vTokenContract.balanceOf(owner.getAddress())).to.equal(BigNumber.from("100000000000000000000000000"));
        });

    })
    describe("RewardToken contract", function(){
        it("Should set deployer as admin", async()=>{
            let ownerAdd = await owner.getAddress();
            expect(await rewardTokenContract.admin()).to.equal(ownerAdd);
        })
        it("Should allow admin to setVaultAddress", async ()=>{
            
            await rewardTokenContract.setVaultAddress(vaultContract.address);
            expect(await rewardTokenContract.vaultAddress()).to.equal(vaultContract.address);
        })
        it("Should not allow non-admin to setVaultAddress", async ()=>{
            
            await expect( rewardTokenContract.connect(user1).setVaultAddress(vaultContract.address)).to.be.revertedWith("ONLY ADMIN");
        });
        
        
        // it("Should allow Vault to generate Rewards", async()=>{
        //     await rewardTokenContract.setVaultAddress(vaultContract.address);
        //     let vaultSigner = vaultContract.signer;
        //     expect(await rewardTokenContract.vaultAddress()).to.equal(vaultContract.address);
            
        //     expect(await rewardTokenContract.connect(vaultSigner).generateReward(user2.address, 10)).to.equal(true);
        //     expect (await rewardTokenContract.balanceOf(user2.address)).to.equal(10);

        // });
        it("Should not allow non-Vault address to generate Rewards", async()=>{
            await rewardTokenContract.setVaultAddress(vaultContract.address);
            
            expect(await rewardTokenContract.vaultAddress()).to.equal(vaultContract.address);
            
            await expect( rewardTokenContract.generateReward(user2.address, 10)).to.revertedWith("ONLY VAULT");
           

        });
        // it("Should allow Vault to burn Rewards", async()=>{
        //     await rewardTokenContract.setVaultAddress(vaultContract.address);
        //     let vaultSigner = vaultContract.signer;
        //     expect(await rewardTokenContract.vaultAddress()).to.equal(vaultContract.address);
        //     await rewardTokenContract.connect(vaultSigner).generateReward(user2.address, 100);
            
        //     (await rewardTokenContract.connect(vaultSigner).burnReward(user2.address, 10));
        //     expect (await rewardTokenContract.balanceOf(user2.address)).to.equal(90);

        // });
        it("Should not allow non-Vault address to burn Rewards", async()=>{
            await rewardTokenContract.setVaultAddress(vaultContract.address);
            let vaultSigner = vaultContract.signer;
            expect(await rewardTokenContract.vaultAddress()).to.equal(vaultContract.address);
            //await rewardTokenContract.connect(vaultSigner).generateReward(user2.address, 100);
            await expect( rewardTokenContract.burnReward(user2.address, 10)).to.revertedWith("ONLY VAULT");
           

        });
        

    });
    describe("MyNFT", function(){

        it("Should allow only owner to set marketplace address", async()=>{
            await expect(myNFTContract.connect(user1).setMarketPlaceAddress(marketPlaceContract.address)).to.be.revertedWith("Only Owner");
        });
        it("Should allow only marketPLace to Mint NFTs", async()=>{
            await myNFTContract.setMarketPlaceAddress(marketPlaceContract.address);
            await expect(myNFTContract.connect(user1).safeMint(user1.address, 0)).to.be.revertedWith("Only Market Place");
        })

    });

    describe("Market Place Contract", function(){
        it("Should not mint to 0 address", async ()=>{
            await expect(marketPlaceContract.mintNFT(ethers.constants.AddressZero)).to.be.revertedWith("Invalid to address");

        });

        it("Should not allow to mint if minting cost was not approved by sender ", async ()=>{

            await vTokenContract.approve(marketPlaceContract.address, 10);
            await expect(marketPlaceContract.mintNFT(owner.address)).to.be.revertedWith("ERC20: insufficient allowance");
        });

        it("Should allow minting if allowance >= cost of minting", async ()=>{
            await vTokenContract.approve(marketPlaceContract.address, BigNumber.from("100"));
            await (marketPlaceContract.mintNFT(owner.address));
            expect(await marketPlaceContract.getOwnerOf(0)).to.equal(owner.address);
       } );

       it("Should allow only owner and cost must > 0 to put NFT on Sale", async ()=>{
            await vTokenContract.transfer(user1.address, 10000);
            await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
            await (marketPlaceContract.connect(user1).mintNFT(user1.address));
            await expect(marketPlaceContract.putNFTonSale(0, 100)).to.revertedWith("Only Owner");
            await expect(marketPlaceContract.connect(user1).putNFTonSale(0, 0)).to.revertedWith("Cost must be > 0");

       });

       it("Should allow owner to put NFT on Sale", async () =>{
            await vTokenContract.approve(marketPlaceContract.address, BigNumber.from("100"));
            await (marketPlaceContract.mintNFT(owner.address));
            await myNFTContract.approve(marketPlaceContract.address, 0);
            await (marketPlaceContract.putNFTonSale(0, 100000));
            expect(await marketPlaceContract.onSaleCost(0)).to.equal(100000);
            
       });

       it("Should NOT allow inValid token Id to be put on Sale", async () =>{
            await vTokenContract.approve(marketPlaceContract.address, BigNumber.from("100"));
            await (marketPlaceContract.mintNFT(owner.address));
            await myNFTContract.approve(marketPlaceContract.address, 0);
            
            await expect(marketPlaceContract.putNFTonSale(1, 100000)).to.be.reverted;
        });
      
        it("Should not allow NON owner to remove an NFT from Sale", async ()=>{
            await vTokenContract.transfer(user1.address, 10000);
            await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
            await (marketPlaceContract.connect(user1).mintNFT(user1.address));  
            await myNFTContract.connect(user1).approve(marketPlaceContract.address, 0);


            await (marketPlaceContract.connect(user1).putNFTonSale(0, 100));
            await expect(marketPlaceContract.removeNFTfromSale(0)).to.revertedWith("NFT not on Sale or Sender is not the Owner");

       });

       it("Should not allow, not on Sale NFT to be removed from Sale", async ()=>{
        await vTokenContract.transfer(user1.address, 10000);
        await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
        await (marketPlaceContract.connect(user1).mintNFT(user1.address));
        
        await expect(marketPlaceContract.connect(user1).removeNFTfromSale(0)).to.revertedWith("NFT not on Sale or Sender is not the Owner");

       });

       it("Should allow owner to remove NFT from Sale", async ()=>{
        await vTokenContract.transfer(user1.address, 10000);
        await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
        await (marketPlaceContract.connect(user1).mintNFT(user1.address));
        await myNFTContract.connect(user1).approve(marketPlaceContract.address, 0);

        await (marketPlaceContract.connect(user1).putNFTonSale(0, 100));
        
        await (marketPlaceContract.connect(user1).removeNFTfromSale(0));
        expect(await marketPlaceContract.onSaleCost(0)).to.equal(0);

       });

       it("Should not allow to buy NFTs which are not on Sale", async()=>{
        await vTokenContract.transfer(user1.address, 10000);
        await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
        await (marketPlaceContract.connect(user1).mintNFT(user1.address));
        await expect(marketPlaceContract.buyNFT(0)).to.revertedWith("This NFT is not on Sale");

       });

       it("Should not allow Owner to buy his own NFT", async()=>{
        await vTokenContract.transfer(user1.address, 10000);
        await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
        await (marketPlaceContract.connect(user1).mintNFT(user1.address));
        await myNFTContract.connect(user1).approve(marketPlaceContract.address, 0);

        await (marketPlaceContract.connect(user1).putNFTonSale(0, 1000));

        await expect(marketPlaceContract.connect(user1).buyNFT(0)).to.revertedWith("Sender already owns the NFT");

       });

       it("Should allow users to buy NFT if they approve for NFT cost", async()=>{
        await vTokenContract.transfer(user1.address, 10000);
        await vTokenContract.connect(user1).approve(marketPlaceContract.address, BigNumber.from("100"));
        await (marketPlaceContract.connect(user1).mintNFT(user1.address));
        
        // await marketPlaceContract.connect(user1).approve(marketPlaceContract.address, 0);
        // let approved = await marketPlaceContract.getApproved(0);
        // expect( approved).to.equal(marketPlaceContract.address);
        await myNFTContract.connect(user1).approve(marketPlaceContract.address, 0);

        await (marketPlaceContract.connect(user1).putNFTonSale(0, 100));
        expect(await marketPlaceContract.getOwnerOf(0)).to.equal(marketPlaceContract.address);
        
        await vTokenContract.approve( marketPlaceContract.address, 10000);
        await (marketPlaceContract.buyNFT(0));
        expect(await marketPlaceContract.getOwnerOf(0)).to.equal(owner.address);

       });

       it("ss", async()=>{
        await test2Contract.test2();


       })

    });
    

});

