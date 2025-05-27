"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function AccountBalancePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fields = [
    {
      name: 'ccy',
      label: 'Currency',
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
      if (formData.ccy) params.append('ccy', formData.ccy);
      
      const queryString = params.toString();
      const url = `/api/account/balance${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting account balance');
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
      title="Account balance" 
      description="Get information about the account balance"
      apiEndpoint="/api/account/balance"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-account-get-balance"
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
