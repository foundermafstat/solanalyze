"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function AccountBillsPage() {
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
        { label: 'SPOT', value: 'SPOT' },
        { label: 'MARGIN', value: 'MARGIN' },
        { label: 'SWAP', value: 'SWAP' },
        { label: 'FUTURES', value: 'FUTURES' },
        { label: 'OPTION', value: 'OPTION' },
      ],
    },
    {
      name: 'ccy',
      label: 'Валюта',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'type',
      label: 'Тип счета',
      type: 'select' as const,
      required: false,
      options: [
        { label: 'Пополнение', value: '1' },
        { label: 'Вывод', value: '2' },
        { label: 'Торговля', value: '13' },
        { label: 'Комиссия', value: '14' },
        { label: 'Все', value: '' },
      ],
    },
    {
      name: 'limit',
      label: 'Лимит (количество записей)',
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
      if (formData.ccy) params.append('ccy', formData.ccy);
      if (formData.type) params.append('type', formData.type);
      if (formData.limit) params.append('limit', formData.limit);
      
      const queryString = params.toString();
      const url = `/api/account/bills${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Произошла ошибка при получении счетов');
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
      title="Счета" 
      description="Получение информации о счетах и финансовых операциях"
      apiEndpoint="/api/account/bills"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days"
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
