"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function MarketCandlesPage() {
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
      name: 'bar',
      label: 'Time interval',
      type: 'select' as const,
      required: false,
      options: [
        { label: '1 minute', value: '1m' },
        { label: '3 minutes', value: '3m' },
        { label: '5 minutes', value: '5m' },
        { label: '15 minutes', value: '15m' },
        { label: '30 minutes', value: '30m' },
        { label: '1 hour', value: '1H' },
        { label: '2 hours', value: '2H' },
        { label: '4 hours', value: '4H' },
        { label: '6 hours', value: '6H' },
        { label: '12 hours', value: '12H' },
        { label: '1 day', value: '1D' },
        { label: '1 week', value: '1W' },
        { label: '1 month', value: '1M' },
        { label: '3 months', value: '3M' },
        { label: '6 months', value: '6M' },
        { label: '1 year', value: '1Y' },
      ],
    },
    {
      name: 'limit',
      label: 'Limit (number of candles)',
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
      params.append('instId', formData.instId);
      
      // Опциональные параметры
      if (formData.bar) params.append('bar', formData.bar);
      if (formData.limit) params.append('limit', formData.limit);
      
      const queryString = params.toString();
      const url = `/api/market/candles?${queryString}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting candles data');
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
      title="Candles" 
      description="Get candlestick (OHLC) data for the specified instrument"
      apiEndpoint="/api/market/candles"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Request parameters"
        description="Specify the instrument ID and parameters to get candlestick data."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
