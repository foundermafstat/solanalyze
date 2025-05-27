"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function AccountPositionsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fields = [
    {
      name: 'instType',
      label: 'Instrument type',
      type: 'select' as const,
      required: false,
      options: [
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
      name: 'posId',
      label: 'Position ID',
      type: 'text' as const,
      required: false,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const params = new URLSearchParams();
      
      // Добавление параметров в запрос только если они заполнены
      if (formData.instType) params.append('instType', formData.instType);
      if (formData.instId) params.append('instId', formData.instId);
      if (formData.posId) params.append('posId', formData.posId);
      
      const queryString = params.toString();
      const url = `/api/account/positions${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting positions');
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
      title="Positions" 
      description="Get information about current positions"
      apiEndpoint="/api/account/positions"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-account-get-positions"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Request parameters"
        description="Specify optional parameters to filter the results."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
