import { ethers } from "ethers";
import Transaction from "../models/transaction.js";
import userActivity from "../models/userActivity.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const walletAbi = require("../abi/MultiSigWallet.json");

// registry to prevent duplicate listeners
const attachedWallets = new Set();

export default function listenToWallet(walletAddress, provider) {
  
  if (attachedWallets.has(walletAddress)) {
    console.log(`Listeners already attached for wallet: ${walletAddress}`);
    return; // avoid duplicates
  }

  attachedWallets.add(walletAddress);
  console.log(`Attaching listeners for wallet: ${walletAddress}`);

  const walletContract = new ethers.Contract(
    walletAddress,
    walletAbi.abi || walletAbi,
    provider
  );

  // TransactionSubmitted
  walletContract.on("TransactionSubmitted", async (tx_id, submitter) => {
    console.log(`Transaction submitted by ${submitter} with id ${tx_id}`);
    try {
      const tx = await walletContract.transactions(tx_id);

      const newTx = new Transaction({
        walletAddress: walletAddress,
        transactionId: Number(tx_id),
        destination: tx.destination,
        value: Number(tx.value),
        approvals: Number(tx.approvals),
        executed: tx.executed,
        data: tx.data,
        submittedBy: submitter,
        submittedAt: Math.floor(Date.now() / 1000),
      });
      await newTx.save();
      console.log("Transaction saved to DB");
    } catch (err) {
      console.log("Error while saving submission:", err);
    }

    try {
      const newActivity = new userActivity({
        userAddress: submitter,
        activityType: "Transaction Submitted",
        timestamp: Math.floor(Date.now() / 1000),
        transactionId: Number(tx_id),
        walletAddress: walletAddress,
      });
      await newActivity.save();
    } catch (err) {
      console.log("Error saving activity:", err);
    }
  });

  // TransactionApproved
  walletContract.on("TransactionApproved", async (tx_id, approver) => {
    console.log(`Transaction approved by ${approver} with id ${tx_id}`);

    try {
      const tx = await walletContract.transactions(tx_id);

      await Transaction.findOneAndUpdate(
        {
          walletAddress: walletAddress,
          transactionId: Number(tx_id),
        },
        {
          $set: { approvals: Number(tx.approvals) },
          $addToSet: { approvedBy: approver },
        },
        { new: true, upsert: true }
      );
    } catch (err) {
      console.log("Error in approval update:", err);
    }

    try {
      await new userActivity({
        userAddress: approver,
        activityType: "Transaction Approved",
        timestamp: Math.floor(Date.now() / 1000),
        transactionId: Number(tx_id),
        walletAddress: walletAddress,
      }).save();
    } catch (err) {
      console.log("Error saving approval activity:", err);
    }
  });

  // TransactionExecuted
  walletContract.on("TransactionExecuted", async (tx_id, executer, event) => {
    console.log(`Transaction executed by ${executer} with id ${tx_id}`);

    const block = await provider.getBlock(event.blockNumber);
    const timestamp = block.timestamp;

    try {
      await Transaction.findOneAndUpdate(
        {
          walletAddress: walletAddress,
          transactionId: Number(tx_id),
        },
        {
          $set: {
            executed: true,
            executedBy: executer,
            executedAt: timestamp,
          },
        },
        { new: true }
      );
    } catch (err) {
      console.log("Error in execution update:", err);
    }

    try {
      await new userActivity({
        userAddress: executer,
        activityType: "Transaction Executed",
        timestamp,
        transactionId: Number(tx_id),
        walletAddress: walletAddress,
      }).save();
    } catch (err) {
      console.log("Error saving execution activity:", err);
    }
  });

  // ApprovalRevoked
  walletContract.on("ApprovalRevoked", async (tx_id, revoker) => {
    console.log(`Approval revoked by ${revoker} with id ${tx_id}`);

    try {
      const tx = await walletContract.transactions(tx_id);

      await Transaction.findOneAndUpdate(
        {
          walletAddress: walletAddress,
          transactionId: Number(tx_id),
        },
        {
          $set: { approvals: Number(tx.approvals) },
          $pull: { approvedBy: revoker },
        },
        { new: true }
      );
    } catch (err) {
      console.log("Error updating revocation:", err);
    }

    try {
      await new userActivity({
        userAddress: revoker,
        activityType: "Transaction Revoked",
        timestamp: Math.floor(Date.now() / 1000),
        transactionId: Number(tx_id),
        walletAddress: walletAddress,
      }).save();
    } catch (err) {
      console.log("Error saving revoke activity:", err);
    }
  });
}
