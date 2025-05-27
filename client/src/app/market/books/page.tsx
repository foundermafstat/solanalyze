"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function MarketBooksPage() {
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
      name: 'sz',
      label: 'Size (number of orders)',
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
      if (formData.sz) params.append('sz', formData.sz);
      
      const queryString = params.toString();
      const url = `/api/market/books?${queryString}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting order book');
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
      title="Order book" 
      description="Get order book data for the specified instrument"
      apiEndpoint="/api/market/books"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-market-data-get-order-book"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Request parameters"
        description="Specify the instrument ID to get the order book. Optionally, you can specify the size (number of orders)."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
