"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function MarketTickersPage() {
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
      name: 'uly',
      label: 'Base asset (optional)',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'instFamily',
      label: 'Instrument family (optional)',
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
      if (formData.uly) params.append('uly', formData.uly);
      if (formData.instFamily) params.append('instFamily', formData.instFamily);
      
      const queryString = params.toString();
      const url = `/api/market/tickers?${queryString}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting tickers data');
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
      title="Tickers" 
      description="Get the latest tickers data for all trading pairs"
      apiEndpoint="/api/market/tickers"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-market-data-get-tickers"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Request parameters"
        description="Specify parameters to get tickers data."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
