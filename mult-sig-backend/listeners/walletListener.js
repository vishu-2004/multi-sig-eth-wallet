import { ethers } from "ethers";
import Transaction from "../models/transaction.js";
import userActivity from "../models/userActivity.js";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const walletAbi = require('../abi/MultiSigWallet.json');

export default function listenToWallet(walletAddress, provider) {
    const walletContract = new ethers.Contract(
        walletAddress,
        walletAbi.abi||walletAbi,
        provider
    );

    walletContract.on("TransactionSubmitted",async(tx_id, submitter)=>{
        console.log(`Transaction submitted by ${submitter} with id ${tx_id}`);

        try{
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
                submittedAt: Math.floor(Date.now() / 1000) 
            });

            await newTx.save();
            console.log("Transaction saved to DB ✅");

        }catch(err){
            console.log("Error occured in tr submission");
        }

        //update user activity
        try{


             const newActivity = new userActivity({
            userAddress:submitter,
            activityType: "Transaction Submitted",
            timestamp:Math.floor(Date.now() / 1000),
            transactionId:tx_id,
            walletAddress:walletAddress
        })
        await newActivity.save();
        console.log("Submit activity tracked");
        }catch(err){
            console.log("Error occured in tr activity saving");
        }
       

    })

    walletContract.on("TransactionApproved",async(tx_id, approver)=>{
        console.log(`Transaction approved by ${approver} with id ${tx_id}`);

        try{
            const tx = await walletContract.transactions(tx_id);

            const updatedTx = await Transaction.findOneAndUpdate({
                walletAddress:walletAddress,
                transactionId: Number(tx_id)
            },
            {
                $set:{
                    approvals: Number(tx.approvals),
                },
                $addToSet:{
                    approvedBy: approver
                }
            },
            {new:true}
        
        )
        if(updatedTx){
            console.log("Transaction updated in DB ✅");
        }else{
            console.log("Transaction not found in DB");
        }

        }catch(err){
            console.log("Error occured in tr approval",err);
        }

        //save activity
        try{
            const newActivity = new userActivity({
            userAddress:approver,
            activityType: "Transaction Approved",
            timestamp:Math.floor(Date.now() / 1000),
            transactionId:Number(tx_id),
            walletAddress:walletAddress
        })
        await newActivity.save();
        console.log("Submit activity tracked");
        }catch(err){
            console.log("Error occured in tr, approved activity saving");
        }

    })

    walletContract.on("TransactionExecuted", async (tx_id, executer) => {
    console.log(`Transaction executed by ${executer} with id ${tx_id}`);

    try {
        const tx = await walletContract.transactions(tx_id);
        const submittedTx = await provider.getTransaction(tx_id); // getTransaction hash

        const receipt = await provider.getTransactionReceipt(submittedTx.hash);
        const block = await provider.getBlock(receipt.blockNumber);
        const executionTimestamp = block.timestamp;

        const updatedTx = await Transaction.findOneAndUpdate(
            {
                walletAddress: walletAddress,
                transactionId: Number(tx_id)
            },
            {
                $set: {
                    executed: true,
                    executedBy: executer,
                    executedAt: executionTimestamp
                }
            },
            { new: true }
        );

        console.log("Updated Transaction after execution:", updatedTx);
    } catch (err) {
        console.log("Error occurred in tr execution:", err);
    }

     //save activity
        try{
            const newActivity = new userActivity({
            userAddress:executer,
            activityType: "Transaction Executed",
            timestamp:Math.floor(Date.now() / 1000),
            transactionId:Number(tx_id),
            walletAddress:walletAddress
        })
        await newActivity.save();
        console.log("Execution activity tracked");
        }catch(err){
            console.log("Error occured in tr, execute activity saving");
        }
});

walletContract.on("ApprovalRevoked", async (tx_id, revoker) => {
    console.log(`Transaction approval revoked by ${revoker} with id ${tx_id}`);

    try {
        const tx = await walletContract.transactions(tx_id);

        const updatedTx = await Transaction.findOneAndUpdate(
            {
                walletAddress: walletAddress,
                transactionId: Number(tx_id)
            },
            {
                $set: {
                    approvals: tx.approvals
                },
                $pull: {
                    approvedBy: revoker
                }
            },
            { new: true }
        );

        console.log("Updated Transaction after revocation:", updatedTx);
    } catch (err) {
        console.log("Error occurred in tr revocation:", err);
    }
     //save activity
        try{
            const newActivity = new userActivity({
            userAddress:revoker,
            activityType: "Transaction Revoked",
            timestamp:Math.floor(Date.now() / 1000),
            transactionId:Number(tx_id),
            walletAddress:walletAddress
        })
        await newActivity.save();
        console.log("revoke activity tracked");
        }catch(err){
            console.log("Error occured in tr, revoke activity saving");
        }
});


    


}