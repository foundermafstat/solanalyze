'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Динамический импорт компонентов теперь перемещен в клиентский компонент
const MarketStats = dynamic(() => import('./MarketStats'), {
  ssr: false,
  loading: () => <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8"><p className="text-gray-500">Загрузка статистики...</p></div>
});

// const LiveChart = dynamic(() => import('./LiveChartFixed'), {
//   ssr: false,
//   loading: () => <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8"><p className="text-gray-500">Загрузка графика...</p></div>
// });

// const OkxPriceChart = dynamic(() => import('./OkxPriceChart'), {
//   ssr: false,
//   loading: () => <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8"><p className="text-gray-500">Загрузка актуальных данных OKX...</p></div>
// });

import RealtimeChartA from './RealtimeChartA';
import RealtimeChartB from './RealtimeChartB';
import RealtimeChartSol from './RealtimeChartSol';

export default function DashboardSection() {
  return (
    <section className="mb-10">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <RealtimeChartA />
        </div>
        <div>
          <RealtimeChartB />
        </div>
        <div>
          <RealtimeChartSol />
        </div>
      </div>
    </section>
  );
}
