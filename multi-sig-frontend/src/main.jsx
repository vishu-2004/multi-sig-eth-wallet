import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from './provider.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App.jsx'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
     <RainbowKitProvider chains={[mainnet, sepolia, localhost]}>

        <App />
        
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    
  </StrictMode>,
)
