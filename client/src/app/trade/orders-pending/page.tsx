"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function TradeOrdersPendingPage() {
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
      name: 'instId',
      label: 'ID инструмента',
      type: 'text' as const,
      required: false,
    },
    {
      name: 'ordType',
      label: 'Тип ордера',
      type: 'select' as const,
      required: false,
      options: [
        { label: 'Лимитный', value: 'limit' },
        { label: 'Рыночный', value: 'market' },
        { label: 'Post only', value: 'post_only' },
        { label: 'Fill or kill', value: 'fok' },
        { label: 'Immediate or cancel', value: 'ioc' },
      ],
    },
    {
      name: 'state',
      label: 'Состояние',
      type: 'select' as const,
      required: false,
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Partially filled', value: 'partially_filled' },
      ],
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const params = new URLSearchParams();
      
      // Опциональные параметры
      if (formData.instType) params.append('instType', formData.instType);
      if (formData.instId) params.append('instId', formData.instId);
      if (formData.ordType) params.append('ordType', formData.ordType);
      if (formData.state) params.append('state', formData.state);
      
      const queryString = params.toString();
      const url = `/api/trade/orders-pending${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Произошла ошибка при получении активных ордеров');
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
      title="Активные ордеры" 
      description="Получение информации о активных (неисполненных) ордерах"
      apiEndpoint="/api/trade/orders-pending"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-trade-get-order-list"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Параметры запроса"
        description="Укажите необязательные параметры для фильтрации списка активных ордеров."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
