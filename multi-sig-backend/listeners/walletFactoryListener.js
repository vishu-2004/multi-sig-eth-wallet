import walletListener from './walletListener.js';

function listenToFactoryEvents(factory, provider) {
   
    factory.on('WalletCreated', (creator, walletAddress, threshold, timeLock) => {
        console.log("walletCreated", walletAddress);
        walletListener(walletAddress, provider);
    });
}

export default listenToFactoryEvents;