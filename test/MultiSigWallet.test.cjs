

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");



const createWallet = async () => {
    const accounts = await ethers.getSigners();
    const [owner, owner2, owner3] = accounts;

    const MultiSigFactory = await ethers.getContractFactory("MultiSigFactory");
    const factory = await MultiSigFactory.deploy();
    // await factory.deployed();

    const owners = [owner.address, owner2.address, owner3.address];
    const tx = await factory.createWallet(owners, 2, 30);
    const receipt = await tx.wait();
    

    const walletCreatedEvent = factory.interface.parseLog(
        receipt.logs.find(log =>
            log.topics[0] === factory.interface.getEvent('WalletCreated').topicHash
        )
    );


    const walletAddress = walletCreatedEvent.args.walletAddress;

    const wallet = await ethers.getContractAt("MultiSigWallet", walletAddress);
    return { wallet, walletAddress, owners, accounts };
};


describe("MultiSigFactory", function () {
    let multiSigFactory, accounts, owner, owner2, owner3;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        [owner, owner2, owner3] = accounts;
        const MultiSigFactory = await ethers.getContractFactory("MultiSigFactory");
        multiSigFactory = await MultiSigFactory.deploy();
        // console.log(multiSigFactory, "factoty");
        // await multiSigFactory.deployed();
    })

    it("should deploy the contract correctly", async () => {
        expect(multiSigFactory.target).to.be.properAddress;
    })

    it("should create wallet", async () => {
        const owners = [owner.address, owner2.address, owner3.address];
        const threshold = 2;
        const timeLimit = 60;

        const tx = await multiSigFactory.createWallet(owners, threshold, timeLimit);
        await tx.wait();

        const userWalletCount = await multiSigFactory.getUserWalletCount(owner.address);
        expect(userWalletCount).to.equal(1); // Check the number of wallets

        const newContractAddress = await multiSigFactory.allWallets(0);
        expect(newContractAddress).to.be.properAddress;
    });

    it("should emit WalletCreatedEvent", async () => {
        const owners = [owner.address, owner2.address, owner3.address];
        const threshold = 2;
        const timeLimit = 60;

        await expect(multiSigFactory.createWallet(owners, threshold, timeLimit)).to.emit(multiSigFactory, "WalletCreated").withArgs(owner.address, anyValue, threshold, timeLimit);
    })

    it("should revert if threshold exceeds owner", async () => {
        const owners = [owner.address, owner2.address];
        const threshold = 3;
        const timeLimit = 60;

        const tx = multiSigFactory.createWallet(owners, threshold, timeLimit);
        await expect(tx).to.be.rejectedWith("Must have atleast minimum count address");
    })

    //test for inavlid address
    it("should revert if any address is invalid", async () => {
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        const owners = [owner.address, zeroAddress, owner2.address];
        const threshold = 2;
        const timeLimit = 60;

        await expect(
            multiSigFactory.createWallet(owners, threshold, timeLimit)
        ).to.be.revertedWith("Invalid address not allowed");
    });

    //test for duplicate address

    it("should revert in case of duplicate owner address", async () => {
        const owners = [owner.address, owner2.address, owner.address];
        const threshold = 2;
        const timeLock = 60;

        await expect(multiSigFactory.createWallet(owners, threshold, timeLock)).to.be.revertedWith("No duplicate address allowed");
    })







})

describe("MultiSigWallet", function () {

    it("should submit a transaction", async () => {
        const { wallet, owners, accounts } = await createWallet();

        // Connect to one of the owners explicitly
        const walletWithSigner = wallet.connect(accounts[0]);

        const tx = await walletWithSigner.submitTransaction(
            owners[1],
            ethers.parseEther("1"),
            "0x"
        );
        await tx.wait();


        const submittedTx = await wallet.transactions(0);
        expect(submittedTx.destination).to.equal(owners[1]);
        expect(submittedTx.value.toString()).to.equal(ethers.parseEther("1").toString());
    });

    it("should emit TransactionSubmitted event", async () => {
        const { wallet, owners } = await createWallet();

        await expect(
            wallet.submitTransaction(owners[1], ethers.parseEther("1"), "0x")
        ).to.emit(wallet, "TransactionSubmitted")
            .withArgs(0);
    });

    it("should be reverted if invalid adreess provided when submitting", async () => {
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        const { wallet } = await createWallet();
        await expect(wallet.submitTransaction(zeroAddress, ethers.parseEther("1"), "0x")).to.be.revertedWith("Invalid destination address");
    })

    it("should be reveted if invalid or 0 amount is provided while submitting", async () => {
        const { wallet, owners } = await createWallet();
        await expect(wallet.submitTransaction(owners[1], ethers.parseEther("0"), "0x")).to.be.revertedWith("Invalid value");
    })

    it("should approve transaction", async () => {
        const { wallet, owners, accounts } = await createWallet();

        const walletWithSigner = wallet.connect(accounts[0]);
        const tx = await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x");
        await tx.wait();

        const approveTx = await walletWithSigner.approveTransaction(0);
        await approveTx.wait();

        const approvedTx = await wallet.transactions(0);
        expect(approvedTx.approvals).to.eq(1);

        const isApproved = await wallet.isApproved(0, owners[0]);
        expect(isApproved).to.eq(true);
    });

    it("should revert if transaction id is out of bounds", async () => {
        const { wallet, accounts } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        // Trying to approve a non-existent transaction
        await expect(walletWithSigner.approveTransaction(99))
            .to.be.revertedWith("transaction id out of bounds");
    });

    it("should revert if the transaction is already approved by the caller", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        // Submit a transaction
        const tx = await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x");
        await tx.wait();

        // Approve it once
        await walletWithSigner.approveTransaction(0);

        // Try approving again
        await expect(walletWithSigner.approveTransaction(0))
            .to.be.revertedWith("Already Approved");
    });

    it("should emit TransactionApproved event", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);
        const tx = await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x")
        await tx.wait();
        const approvedTx = await walletWithSigner.approveTransaction(0);

        expect(approvedTx).to.emit(wallet, "TransactionApproved").withArgs(0);
    })

    it("should execute a transaction", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);
        const walletWith2ndSigner = wallet.connect(accounts[1]);
        await accounts[0].sendTransaction({
            to: wallet.target,
            value: ethers.parseEther("10"), // send 10 ETH to the multisig wallet
        });

        const submitTx = await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x")
        await submitTx.wait();

        const approve1Tx = await walletWithSigner.approveTransaction(0);
        await approve1Tx.wait();

        const approve2Tx = await walletWith2ndSigner.approveTransaction(0);
        await approve2Tx.wait();

        await network.provider.send("evm_increaseTime", [3600]); // e.g., increase by 1 hour
        await network.provider.send("evm_mine"); // mine a block to apply time change

        const executeTx = await walletWithSigner.executeTransaction(0);
        await executeTx.wait();

        const executedTransaction = await wallet.transactions(0);

        expect(executedTransaction.executed).to.eq(true);

    })

    it("should emit TransactionExecuted on success", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x");
        await walletWithSigner.approveTransaction(0);
        await wallet.connect(accounts[1]).approveTransaction(0);

        // Send ETH to the contract
        await accounts[0].sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });
        await network.provider.send("evm_increaseTime", [3600]); // e.g., increase by 1 hour
        await network.provider.send("evm_mine"); // mine a block to apply time change

        await expect(walletWithSigner.executeTransaction(0))
            .to.emit(wallet, "TransactionExecuted")
            .withArgs(0);
    });

    it("should revert if wallet doesn't have enough balance", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("5"), "0x");
        await walletWithSigner.approveTransaction(0);
        await wallet.connect(accounts[1]).approveTransaction(0);
        await network.provider.send("evm_increaseTime", [3600]); // e.g., increase by 1 hour
        await network.provider.send("evm_mine"); // mine a block to apply time change

        await expect(walletWithSigner.executeTransaction(0)).to.be.revertedWith("Insufficient wallet balance");
    });

    it("should revert if not enough approvals", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x");
        await walletWithSigner.approveTransaction(0); // Only one approval

        await accounts[0].sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });
        await network.provider.send("evm_increaseTime", [3600]); // e.g., increase by 1 hour
        await network.provider.send("evm_mine"); // mine a block to apply time change

        await expect(walletWithSigner.executeTransaction(0)).to.be.revertedWith("Not enough approvals");
    });

    it("should revert if timelock has not expired", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x");

        await walletWithSigner.approveTransaction(0);
        await wallet.connect(accounts[1]).approveTransaction(0);

        await accounts[0].sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });

        await expect(walletWithSigner.executeTransaction(0)).to.be.revertedWith("Timelock not expired");
    });


    it("should revert if transaction already executed", async () => {
        const { wallet, accounts, owners } = await createWallet();
        const walletWithSigner = wallet.connect(accounts[0]);

        await walletWithSigner.submitTransaction(owners[1], ethers.parseEther("1"), "0x");

        // Approve from two owners
        await walletWithSigner.approveTransaction(0);
        await wallet.connect(accounts[1]).approveTransaction(0);

        // Fund wallet so it can execute
        await accounts[0].sendTransaction({ to: wallet.target, value: ethers.parseEther("2") });

        // Execute first time
        await network.provider.send("evm_increaseTime", [3600]); // e.g., increase by 1 hour
        await network.provider.send("evm_mine"); // mine a block to apply time change
        await walletWithSigner.executeTransaction(0);

        // Try again
        await expect(walletWithSigner.executeTransaction(0)).to.be.revertedWith("Transaction already executed");
    });


    it("should revert if tx_id is out of bounds", async () => {
        const { wallet } = await createWallet();
        await expect(wallet.executeTransaction(99)).to.be.revertedWith("Transaction id out of bounds");
    });




})
