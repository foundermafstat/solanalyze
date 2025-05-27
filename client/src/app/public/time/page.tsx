"use client";

import { useState, useEffect } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiResults from '@/components/ui/ApiResults';

export default function PublicTimePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchServerTime = async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response = await fetch('/api/public/time');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Произошла ошибка при получении серверного времени');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServerTime();
  }, []);

  return (
    <ApiPageLayout 
      title="Серверное время" 
      description="Получение текущего серверного времени OKX API"
      apiEndpoint="/api/public/time"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-public-data-get-system-time"
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Серверное время</h2>
          <button
            onClick={fetchServerTime}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>
        <p className="text-gray-600 mt-2 mb-4">
          Этот эндпоинт возвращает текущее время сервера OKX API в формате Unix timestamp (миллисекунды).
        </p>
      </div>
      
      <ApiResults 
        data={data} 
        error={error} 
        isLoading={isLoading} 
      />
    </ApiPageLayout>
  );
}
