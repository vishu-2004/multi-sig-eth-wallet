import walletListener from './walletListener.js';

const attachedWallets = new Set();
let factoryListenerAttached = false;

function listenToFactoryEvents(factory, provider) {

  // prevent multiple subscriptions to WalletCreated
  if (!factoryListenerAttached) {
    factoryListenerAttached = true;

    factory.on('WalletCreated', (creator, walletAddress, threshold, timeLock) => {
      console.log("WalletCreated:", walletAddress);

      // avoid attaching duplicate wallet listeners
      if (!attachedWallets.has(walletAddress)) {
        attachedWallets.add(walletAddress);
        walletListener(walletAddress, provider);
      }
    });
  }
}

export default listenToFactoryEvents;
