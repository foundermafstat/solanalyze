'use client';

import { useEffect, useState } from 'react';

type Ticker = {
  instId: string;
  last: string;
  open24h: string;
  high24h: string;
  low24h: string;
  vol24h: string;
  volCcy24h: string;
  change24h: string;
  changeRate24h: string;
};

export default function MarketStats() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Функция для получения данных тикеров
    async function fetchTickers() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/market/tickers?instType=SPOT');
        
        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data.data)) {
          // Отбираем топ-5 тикеров по объему
          const sortedTickers = data.data
            .sort((a: Ticker, b: Ticker) => Number.parseFloat(b.vol24h) - Number.parseFloat(a.vol24h))
            .slice(0, 5);
          
          setTickers(sortedTickers);
        } else {
          setTickers([]);
        }
      } catch (err) {
        console.error('Ошибка при получении данных тикеров:', err);
        setError('Не удалось загрузить рыночные данные');
      } finally {
        setLoading(false);
      }
    }

    // Получаем данные при первой загрузке
    fetchTickers();
    
    // Устанавливаем интервал для обновления данных
    const intervalId = setInterval(fetchTickers, 30000); // Обновляем каждые 30 секунд
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Рыночная статистика</h2>
      
      {loading && <p className="text-gray-500 dark:text-gray-400">Загрузка статистики...</p>}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && tickers.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Нет доступных данных</p>
      )}
      
      {!loading && !error && tickers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-950">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Инструмент</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Цена</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Изменение 24ч</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Объем 24ч</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {tickers.map((ticker) => {
                const changeRate = Number.parseFloat(ticker.changeRate24h) * 100;
                const isPositive = changeRate >= 0;
                
                return (
                  <tr key={ticker.instId}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ticker.instId}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {Number.parseFloat(ticker.last).toFixed(2)}
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {changeRate.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {Number.parseFloat(ticker.volCcy24h).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
