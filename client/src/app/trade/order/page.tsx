"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function TradeOrderPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fields = [
    {
      name: 'instId',
      label: 'Instrument ID',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'tdMode',
      label: 'Trading mode',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Cross', value: 'cross' },
        { label: 'Isolated', value: 'isolated' },
        { label: 'Cash', value: 'cash' },
      ],
    },
    {
      name: 'side',
      label: 'Side',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Buy', value: 'buy' },
        { label: 'Sell', value: 'sell' },
      ],
    },
    {
      name: 'ordType',
      label: 'Order type',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Limit', value: 'limit' },
        { label: 'Market', value: 'market' },
        { label: 'Post only', value: 'post_only' },
        { label: 'Fill or kill', value: 'fok' },
        { label: 'Immediate or cancel', value: 'ioc' },
      ],
    },
    {
      name: 'sz',
      label: 'Order size',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'px',
      label: 'Order price (not required for market orders)',
      type: 'text' as const,
      required: false,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Проверка необходимости указания цены для лимитных ордеров
      if (['limit', 'post_only', 'fok', 'ioc'].includes(formData.ordType) && !formData.px) {
        throw new Error('For this order type, you must specify a price');
      }
      
      const response = await fetch('/api/trade/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error creating order');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiPageLayout 
      title="Order creation" 
      description="Create a new trading order"
      apiEndpoint="/api/trade/order"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-trade-place-order"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        method="POST"
        title="Order parameters"
        description="Specify parameters for creating a new order. Note that for limit orders, you must specify a price."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
