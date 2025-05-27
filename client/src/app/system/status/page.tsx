"use client";

import { useState, useEffect } from 'react';
import ApiPageLayout from '@/components/layout/ApiPageLayout';
import ApiResults from '@/components/ui/ApiResults';

export default function SystemStatusPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const response = await fetch('/api/system/status');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Error getting system status');
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <ApiPageLayout 
      title="System status" 
      description="Get information about the current status of the system and API key status"
      apiEndpoint="/api/system/status"
      docsUrl="https://www.okx.com/docs-v5/en/#rest-api-status"
    >
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Статус системы</h2>
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Загрузка...' : 'Обновить'}
          </button>
        </div>
        <p className="text-gray-600 mt-2 mb-4">
          Updates information about API availability and system status. This is a free endpoint that does not require authentication.
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
