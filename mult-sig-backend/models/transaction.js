const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
walletId:{type:Number, required:true},
  transactionId: { type: Number, unique: true, required: true },
  destination: { type: String, required: true },
  value: { type: Number, required: true },
  approvals: { type: Number, required: true },
  executed: { type: Boolean, required: true }, 
  data: { type: String },
  submittedBy:{type:String,required:true},
  executedBy:{type:String},
  timestamp: { type: Number, required: true },
  approvedBy: { type: [String], default: [] } 
});

module.exports = mongoose.model("Transaction", transactionSchema);
