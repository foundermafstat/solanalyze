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
      label: 'Тип инструмента',
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
      label: 'ID инструмента',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'posId',
      label: 'ID позиции',
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
        throw new Error(result.message || 'Произошла ошибка при получении позиций');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiPageLayout 
      title="Позиции" 
      description="Получение информации о текущих позициях"
      apiEndpoint="/api/account/positions"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-account-get-positions"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Параметры запроса"
        description="Укажите необязательные параметры для фильтрации результатов."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
