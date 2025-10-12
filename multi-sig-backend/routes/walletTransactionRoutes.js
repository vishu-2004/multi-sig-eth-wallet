import { Router } from "express";
import Transaction from "../models/transaction.js";
import UserActivity from "../models/userActivity.js";

const router = Router();

router.get("/transactions",async(req,res)=>{
    const {transactionId,walletAddress} = req.query;

    try{

        if(!walletAddress){
        return res.status(400).json({error:"Wallet address is required"});
    }
    const filter = {walletAddress}

    if(transactionId){
        filter.transactionId = transactionId;
    }
    const transactions = await Transaction.find(filter);
    if(transactions.length === 0){
        return res.status(404).json({error:"No transactions found"});
    }
    res.status(200).json(transactions);

    }catch(err){
        console.log("Error fetching transactions",err);
        return res.status(500).json({message:"error fetching transactions"});
    }
    




})

router.get("/getUserActivity",async(req,res)=>{
    const {userAddress} = req.query;

    try{
        if(!userAddress){
            return res.status(400).json({error:"User address is required"});
        }
        const userActivity = await UserActivity.find({userAddress});
        if(userActivity.length === 0){
            return res.status(404).json({error:"No user activity found"});
        }
        res.status(200).json(userActivity);
    }catch(err){
        console.log("Error fetching user activity", err);
    return res.status(500).json({ message: "Error fetching user activity" }); 
    }
})

export default router;