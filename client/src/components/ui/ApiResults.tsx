import React from 'react';

interface ApiResultsProps {
  data: any;
  error?: string;
  isLoading: boolean;
}

const ApiResults: React.FC<ApiResultsProps> = ({ data, error, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium mb-2">Ошибка</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-500 italic">Нет данных для отображения. Выполните запрос.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-gray-800 font-medium mb-2">Результат запроса</h3>
      <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-[500px] text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default ApiResults;
