import { Connection, PublicKey, ParsedConfirmedTransaction } from '@solana/web3.js';

export async function getBalance(address: string, endpoint: string): Promise<number> {
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    return lamports / 1e9;
  } catch (e) {
    throw new Error('Ошибка получения баланса: ' + (e as Error).message);
  }
}

export async function getTransactions(address: string, endpoint: string, limit = 10): Promise<ParsedConfirmedTransaction[]> {
  try {
    const connection = new Connection(endpoint, 'confirmed');
    const pubkey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit });
    if (!signatures.length) return [];
    const txs = await Promise.all(
      signatures.map(async (sig) => {
        try {
          return await connection.getParsedTransaction(sig.signature, { commitment: 'confirmed' });
        } catch {
          return null;
        }
      })
    );
    return txs.filter(Boolean) as ParsedConfirmedTransaction[];
  } catch (e) {
    throw new Error('Ошибка получения истории: ' + (e as Error).message);
  }
}
