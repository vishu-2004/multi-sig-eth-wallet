import { ethers } from "ethers";
import walletAbi from '../abi/MultiSigWallet.json' assert { type: 'json' };



export default function listenToWallet(walletAddress, provider) {
    const walletContract = new ethers.Contract(
        walletAddress,
        walletAbi,
        provider
    );

    walletContract.on("TransactionSubmitted",(tx_id, submitter)=>{
        console.log(`Transaction submitted by ${submitter} with id ${tx_id}`);

    })

    walletContract.on("TransactionApproved",(tx_id, approver)=>{
        console.log(`Transaction approved by ${approver} with id ${tx_id}`);
    })

    walletContract.on("TransactionExecuted",(tx_id, executer)=>{
        console.log(`Transaction executed by ${executer} with id ${tx_id}`);
    })

    walletContract.on("ApprovalRevoked",(tx_id, revoker)=>{
        console.log(`Transaction approval revoked by ${revoker} with id ${tx_id}`);
    })

    


}