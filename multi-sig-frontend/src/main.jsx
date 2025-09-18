import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider,darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from './provider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet, sepolia, localhost } from 'wagmi/chains'   // ✅ Added this line

import App from './App.jsx'
import "./index.css";


const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
     <RainbowKitProvider chains={[mainnet, sepolia, localhost]}
      theme={darkTheme()} 
    >

        <App />
        
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    
  </StrictMode>,
)
