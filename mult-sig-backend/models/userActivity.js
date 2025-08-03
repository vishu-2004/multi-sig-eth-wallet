import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
    userAddress: {
        type: String,
        required: true
    },
    activityType: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000) 
    },
    walletAddress:{type:String, required:true},
  transactionId: { type: Number, required: true },
});

export default mongoose.model("UserActivity", userActivitySchema);
