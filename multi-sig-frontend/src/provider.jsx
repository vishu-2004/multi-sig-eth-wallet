// import { http, createConfig } from 'wagmi'
// import { sepolia, mainnet, localhost, } from 'wagmi/chains'
// import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'


// const projectId = 'dc439a552b67690cd2a10643d0e50a50'

// export const wagmiConfig = createConfig({
//   chains: [mainnet, localhost, sepolia],
//   connectors: [
//     injected(),
//     walletConnect({ projectId }),
//     metaMask(),
//     safe(),
//   ],
//   transports: {
//     [mainnet.id]: http(),
    
//     [sepolia.id]:http(),
//     [localhost.id]: http(),
    
//   },
// })

import { sepolia, hardhat } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const isProd = import.meta.env.VITE_PROD === "true";

export const wagmiConfig = getDefaultConfig({
  appName: "VaultX",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: isProd ? [sepolia] : [hardhat],
  ssr: false,
});

