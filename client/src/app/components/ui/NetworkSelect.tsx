"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolanaNetwork } from "@/app/components/SolanaWalletProvider";
import { Globe2 } from "lucide-react";

export function NetworkSelect() {
  const { publicKey } = useWallet();
  const { network, setNetwork } = useSolanaNetwork();

  if (!publicKey) return null;

  return (
    <div className="flex items-center gap-2">
      <Globe2 className="size-4 text-blue-600" />
      <select
        value={network}
        onChange={e => setNetwork(e.target.value as 'mainnet' | 'devnet' | 'testnet')}
        className="rounded border px-2 py-1 text-xs bg-background text-foreground focus:ring-2 focus:ring-blue-400"
        aria-label="Выбор сети Solana"
      >
        <option value="mainnet">Mainnet</option>
        <option value="devnet">Devnet</option>
        <option value="testnet">Testnet</option>
      </select>
    </div>
  );
}
