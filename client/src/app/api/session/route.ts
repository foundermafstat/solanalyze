import { NextResponse } from 'next/server';

interface TokenPriceData {
  symbol: string;
  price: string;
  timestamp: string;
}

// Helper function to fetch token prices from our server
async function fetchTokenPrices(): Promise<Record<string, TokenPriceData> | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/token-prices`);
    if (!response.ok) {
      console.error('Failed to fetch token prices');
      return null;
    }
    const data = await response.json() as { data?: Record<string, TokenPriceData> };
    return data.data || null;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return null;
  }
}

export async function POST() {
    try {        
        if (!process.env.OPENAI_API_KEY) {
            throw new Error(`OPENAI_API_KEY is not set`);
        }

        // Fetch current token prices
        const tokenPrices = await fetchTokenPrices();
        const currentPrices = tokenPrices ? 
            `Current token prices (USDT): ${Object.entries(tokenPrices)
                .map(([symbol, data]) => 
                    `${symbol}: $${Number.parseFloat(data.price).toFixed(2)}`)
                .join(', ')}`
            : 'Current token prices are currently unavailable.';

        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "alloy",
                modalities: ["audio", "text"],
                instructions: `Start conversation with the user by saying "Hello, how can I help you today?"

You are an AI assistant helping users explore the intersection of AI and Web3, especially in Solana, OKX Web3 API, trading, wallet management, and UX improvement.

${currentPrices}

Use tools to:
- Retrieve wallet balances and assets from OKX Web3 API
- Show transaction history and DeFi activity
- Provide AI-powered trading insights based on on-chain data
- Assist with wallet setup and navigation in Web3 applications

Guidelines:
- Be proactive and helpful
- If a user provides a wallet address, suggest insights you can show
- Explain complex concepts clearly and simply
- Never ask for private keys or sensitive information
- Always speak and respond in the user's language

Example user intents you may assist with:
- "Show my Solana wallet assets"
- "Analyze portfolio performance"
- "Any unusual transactions?"
- "Connect Phantom wallet"
- "Forecast SOL price using AI"
- "What are the current token prices?"

Your responses should be clear, secure, and relevant to AI x Web3 users.`,
                tool_choice: "auto",
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${JSON.stringify(response)}`);
        }

        const data = await response.json();

        // Return the JSON response to the client
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}