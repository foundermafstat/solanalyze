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
      label: 'ID инструмента',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'bar',
      label: 'Временной интервал',
      type: 'select' as const,
      required: false,
      options: [
        { label: '1 минута', value: '1m' },
        { label: '3 минуты', value: '3m' },
        { label: '5 минут', value: '5m' },
        { label: '15 минут', value: '15m' },
        { label: '30 минут', value: '30m' },
        { label: '1 час', value: '1H' },
        { label: '2 часа', value: '2H' },
        { label: '4 часа', value: '4H' },
        { label: '6 часов', value: '6H' },
        { label: '12 часов', value: '12H' },
        { label: '1 день', value: '1D' },
        { label: '1 неделя', value: '1W' },
        { label: '1 месяц', value: '1M' },
        { label: '3 месяца', value: '3M' },
        { label: '6 месяцев', value: '6M' },
        { label: '1 год', value: '1Y' },
      ],
    },
    {
      name: 'limit',
      label: 'Лимит (количество свечей)',
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
        throw new Error(result.message || 'Произошла ошибка при получении свечных данных');
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
      title="Свечи" 
      description="Получение свечных (OHLC) данных для указанного инструмента"
      apiEndpoint="/api/market/candles"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        title="Параметры запроса"
        description="Укажите ID инструмента и параметры для получения свечных данных."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
