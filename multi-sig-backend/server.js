import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import walletTransactionRoutes from './routes/walletTransactionRoutes.js';
import { ethers } from 'ethers';
import { createRequire } from 'module';
import listenToFactoryEvents from './listeners/walletFactoryListener.js';
import bootstrapWalletListeners from './utils/bootstrapListener.js';
 
const require = createRequire(import.meta.url);
const factoryABI = require('./abi/MultiSigFactory.json');

dotenv.config();

const app = express();
let provider;
console.log(process.env.SEPOLIA_RPC_URL)
if (process.env.PROD === "false") {
    provider = new ethers.WebSocketProvider(process.env.SEPOLIA_RPC_URL);
} else {
    provider = new ethers.WebSocketProvider(process.env.SEPOLIA_RPC_URL);
}


const abiToUse = factoryABI.abi || factoryABI;

let factory;
try {
    factory = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abiToUse,
        provider
    );
    
    // console.log("Contract created successfully");
    // console.log("Interface exists:", !!factory.interface);
    
    // if (factory.interface && factory.interface.functions) {
    //     console.log("Available functions:", Object.keys(factory.interface.functions));
    // } else {
    //     console.log("No interface.functions available");
    //     console.log("Interface format fragments:", factory.interface.format());
    // }
} catch (error) {
    console.error("Error creating contract:", error);
    process.exit(1);
}

// Now factory is accessible here
bootstrapWalletListeners(provider); 
listenToFactoryEvents(factory, provider);

app.use(cors());
app.use(express.json());
app.use('/api', walletTransactionRoutes);

await mongoose.connect(process.env.MONGO_URI);
app.listen(5000, () => console.log('Server running on port 5000'));