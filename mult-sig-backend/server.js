import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import walletTransactionRoutes from './routes/walletTransactionRoutes.js';
import { ethers } from 'ethers';
import factoryABI from './abi/MultiSigFactory.json' assert { type: 'json' };
import listenToFactoryEvents from './listeners/walletFactoryListener.js';
import bootstrapWalletListeners from './utils/bootstrapListener.js';

dotenv.config();

const app = express();
let provider;
if (process.env.PROD === "false") {
    provider = new ethers.JsonRpcProvider("http://localhost:8545");
} else {
    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
}

const factory = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    factoryABI,
    provider
);


bootstrapWalletListeners(provider); // Re-attaches listeners on restart
listenToFactoryEvents(factory, provider);


app.use(cors());
app.use(express.json());
app.use('/api', walletTransactionRoutes);

await mongoose.connect(process.env.MONGO_URI);

app.listen(5000, () => console.log('Server running on port 5000'));