import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
walletAddress:{type:String, required:true},
  transactionId: { type: Number, required: true },
  destination: { type: String, required: true },
  value: { type: Number, required: true },
  approvals: { type: Number, required: true },
  executed: { type: Boolean, required: true }, 
  data: { type: String },
  submittedBy:{type:String,required:true},
  executedBy:{type:String},
  submittedAt: { type: Number},
  executedAt:{type:Number},
  approvedBy: { type: [String], default: [] } 
});

export default mongoose.model("Transaction", transactionSchema);
