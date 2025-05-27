"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function TradeOrdersHistoryPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fields = [
    {
      name: 'instType',
      label: 'Instrument type',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'SPOT', value: 'SPOT' },
        { label: 'MARGIN', value: 'MARGIN' },
        { label: 'SWAP', value: 'SWAP' },
        { label: 'FUTURES', value: 'FUTURES' },
        { label: 'OPTION', value: 'OPTION' },
      ],
    },
    {
      name: 'instId',
      label: 'Instrument ID',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'ordType',
      label: 'Order type',
      type: 'select' as const,
      required: false,
      options: [
        { label: 'Limit', value: 'limit' },
        { label: 'Market', value: 'market' },
        { label: 'Post only', value: 'post_only' },
        { label: 'Fill or kill', value: 'fok' },
        { label: 'Immediate or cancel', value: 'ioc' },
      ],
    },
    {
      name: 'state',
      label: 'State',
      type: 'select' as const,
      required: false,
      options: [
        { label: 'Canceled', value: 'canceled' },
        { label: 'Filled', value: 'filled' },
      ],
    },
    {
      name: 'limit',
      label: 'Limit',
      type: 'text' as const,
      required: false,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const params = new URLSearchParams();
      
      // Обязательные параметры
      params.append('instType', formData.instType);
      
      // Опциональные параметры
      if (formData.instId) params.append('instId', formData.instId);
      if (formData.ordType) params.append('ordType', formData.ordType);
      if (formData.state) params.append('state', formData.state);
      if (formData.limit) params.append('limit', formData.limit);
      
      const queryString = params.toString();
      const url = `/api/trade/orders-history?${queryString}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting order history');
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
      title="Order history" 
      description="Get information about order history"
      apiEndpoint="/api/trade/orders-history"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-trade-get-order-history-last-3-months"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Request parameters"
        description="Specify parameters to filter order history."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
