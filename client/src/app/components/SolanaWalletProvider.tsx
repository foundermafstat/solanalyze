"use client";
import { FC, ReactNode, useMemo, useState, useContext, createContext } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";


type SolanaNetwork = "mainnet" | "devnet" | "testnet";
const NETWORK_ENDPOINTS: Record<SolanaNetwork, string> = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
};

const SolanaNetworkContext = createContext<{
  network: SolanaNetwork;
  setNetwork: (n: SolanaNetwork) => void;
} | undefined>(undefined);

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<SolanaNetwork>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('solana-network');
      if (saved === 'mainnet' || saved === 'devnet' || saved === 'testnet') return saved;
    }
    return "mainnet";
  });
  const endpoint = useMemo(() => NETWORK_ENDPOINTS[network], [network]);

  const setNetwork = (n: SolanaNetwork) => {
    setNetworkState(n);
    if (typeof window !== 'undefined') {
      localStorage.setItem('solana-network', n);
    }
  };

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <SolanaNetworkContext.Provider value={{ network, setNetwork }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </SolanaNetworkContext.Provider>
  );
};

export function useSolanaNetwork() {
  const ctx = useContext(SolanaNetworkContext);
  if (!ctx) throw new Error("useSolanaNetwork must be used within SolanaWalletProvider");
  return ctx;
}
