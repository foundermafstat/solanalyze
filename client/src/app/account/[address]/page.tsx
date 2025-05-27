'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBalance, getTransactions } from "@/app/lib/api/solana";
import { useSolanaNetwork } from "@/app/components/SolanaWalletProvider";
import { useWallet } from "@solana/wallet-adapter-react";

export default function AccountPage() {
  const params = useParams();
  const address = params?.address as string;
  const { publicKey } = useWallet();
  const { network } = useSolanaNetwork();
  const endpoint = network === 'mainnet'
    ? 'https://api.mainnet-beta.solana.com'
    : network === 'devnet'
      ? 'https://api.devnet.solana.com'
      : 'https://api.testnet.solana.com';

  const [balance, setBalance] = useState<number|null>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getBalance(address, endpoint),
      getTransactions(address, endpoint, 10)
    ])
      .then(([bal, txs]) => {
        setBalance(bal);
        setTxs(txs);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [address, endpoint, network]);

  if (!publicKey) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Access denied</h1>
        <p className="mb-4">Authorize through the wallet to view the account.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="text-lg break-all mb-2">Address: {address}</div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {balance !== null && (
        <div className="mb-4">
          Balance: <span className="font-mono">{balance} SOL</span>
        </div>
      )}
      {(!loading && txs.length === 0) && <div>No transactions.</div>}
      {txs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Last transactions</h2>
          <ul className="space-y-2">
            {txs.map((tx: any, i: number) => {
              const signature = tx.transaction.signatures[0];
              let explorerUrl = `https://explorer.solana.com/tx/${signature}`;
              if (network === 'devnet') explorerUrl += '?cluster=devnet';
              if (network === 'testnet') explorerUrl += '?cluster=testnet';
              return (
                <li key={signature || i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="font-mono text-xs break-all">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {signature}
                    </a>
                  </div>
                  <div>Slot: {tx.slot}</div>
                  <div>
                    Date:{' '}
                    {tx.blockTime
                      ? new Date(tx.blockTime * 1000).toLocaleString()
                      : 'N/A'}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
