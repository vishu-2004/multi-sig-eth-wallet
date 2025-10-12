import walletListener from './walletListener.js';

function listenToFactoryEvents(factory, provider) {
    // console.log("&&&&&&&&&&&&&&&");
    factory.on('WalletCreated', (creator, walletAddress, threshold, timeLock) => {
        console.log("walletCreate", walletAddress);
        walletListener(walletAddress, provider);
    });
}

export default listenToFactoryEvents;