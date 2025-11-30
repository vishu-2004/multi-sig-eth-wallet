import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, fallback } from "wagmi";

export const wagmiConfig = getDefaultConfig({
  appName: "MultiSig Wallet",
  projectId: "dc439a552b67690cd2a10643d0e50a50",
  chains: [sepolia],
  transports: {
    [sepolia.id]: fallback([
      http(import.meta.env.VITE_SEPOLIA_RPC_URL, {
        timeout: 10_000,
        retryCount: 3,
        retryDelay: 1000,
      }),
      http("https://rpc.sepolia.org"),
      http("https://ethereum-sepolia-rpc.publicnode.com"),
      http("https://rpc2.sepolia.org"),
    ]),
  },
  ssr: false,
});