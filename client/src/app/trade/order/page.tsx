"use client";

import { useState } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiForm from '@/components/ui/ApiForm';
import ApiResults from '@/components/ui/ApiResults';

export default function TradeOrderPage() {
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
      name: 'tdMode',
      label: 'Режим торговли',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Кросс', value: 'cross' },
        { label: 'Изолированный', value: 'isolated' },
        { label: 'Кэш', value: 'cash' },
      ],
    },
    {
      name: 'side',
      label: 'Сторона',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Покупка', value: 'buy' },
        { label: 'Продажа', value: 'sell' },
      ],
    },
    {
      name: 'ordType',
      label: 'Тип ордера',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Лимитный', value: 'limit' },
        { label: 'Рыночный', value: 'market' },
        { label: 'Post only', value: 'post_only' },
        { label: 'Fill or kill', value: 'fok' },
        { label: 'Immediate or cancel', value: 'ioc' },
      ],
    },
    {
      name: 'sz',
      label: 'Размер ордера',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'px',
      label: 'Цена ордера (не требуется для рыночных ордеров)',
      type: 'text' as const,
      required: false,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Проверка необходимости указания цены для лимитных ордеров
      if (['limit', 'post_only', 'fok', 'ioc'].includes(formData.ordType) && !formData.px) {
        throw new Error('Для данного типа ордера необходимо указать цену');
      }
      
      const response = await fetch('/api/trade/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Произошла ошибка при создании ордера');
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
      title="Создание ордера" 
      description="Создание нового торгового ордера"
      apiEndpoint="/api/trade/order"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-trade-place-order"
    >
      <ApiForm 
        fields={fields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        method="POST"
        title="Параметры ордера"
        description="Укажите параметры для создания нового ордера. Обратите внимание, что для лимитных ордеров необходимо указать цену."
      />
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
