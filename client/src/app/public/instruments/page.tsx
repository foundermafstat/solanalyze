"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function PublicInstrumentsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fields = [
    {
      name: 'instType',
      label: 'Тип инструмента',
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
      label: 'Базовый актив (опционально)',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'instId',
      label: 'ID инструмента (опционально)',
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
      if (formData.instId) params.append('instId', formData.instId);
      
      const queryString = params.toString();
      const url = `/api/public/instruments?${queryString}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Произошла ошибка при получении данных инструментов');
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
      title="Инструменты" 
      description="Получение списка доступных торговых инструментов"
      apiEndpoint="/api/public/instruments"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Параметры запроса"
        description="Укажите параметры для получения списка инструментов."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
