import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import MarketStatsTable from './MarketStatsTable';
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js';
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

interface PricePoint {
  time: string;
  price: number;
}

const WS_URL = 'ws://localhost:3001/ws/okx?instId=BTC-USDT';

export default function RealtimeChartA() { // Минималистичный вид, collapsible-детали
  const [data, setData] = useState<PricePoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    wsRef.current = new window.WebSocket(WS_URL);
    wsRef.current.onmessage = (event) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 1000) return;
      lastUpdateRef.current = now;
      try {
        const msg = JSON.parse(event.data);
        if (msg.data && Array.isArray(msg.data) && msg.data[0]?.last) {
          setData((prev) => [
            { time: new Date().toLocaleTimeString(), price: Number.parseFloat(msg.data[0].last) },
            ...prev.slice(0, 29)
          ]);
        }
      } catch {}
    };
    return () => { wsRef.current?.close(); };
  }, []);

  const prices = data.slice().reverse().map(pt => pt.price);
  const times = data.slice().reverse().map(pt => pt.time);
  const current = prices.length > 0 ? prices[prices.length - 1] : null;
  const prev = prices.length > 1 ? prices[prices.length - 2] : null;
  const diff = current !== null && prev !== null ? current - prev : 0;

  const min = prices.length > 0 ? Math.min(...prices) : null;
  const max = prices.length > 0 ? Math.max(...prices) : null;
  const avg = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  // min/max за 5 минут (предполагаем 1 tick = 1 сек, 5*60 = 300)
  const last5 = prices.slice(-300);
  const min5 = last5.length ? Math.min(...last5) : null;
  const max5 = last5.length ? Math.max(...last5) : null;
  // min/max за 15 минут
  const last15 = prices.slice(-900);
  const min15 = last15.length ? Math.min(...last15) : null;
  const max15 = last15.length ? Math.max(...last15) : null;
  // объём (заглушка, если появится в данных - сюда подставить)
  const volume = null;

  const chartData = {
    labels: times,
    datasets: [
      {
        label: 'BTC-USDT',
        data: prices,
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.1)',
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
      },
    },
    layout: {
      padding: {
        bottom: 16,
        left: 0,
        right: 0,
        top: 0,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#cbd5e1",
          maxTicksLimit: 5,
          padding: 2,
          font: { size: 10 },
          callback: function(value, index, ticks) {
            // Показываем только каждую вторую подпись, чтобы не было наложения
            return index % 2 === 0 ? this.getLabelForValue(value) : '';
          },
        },
      },
      y: {
        grid: {
          color: "#334155",
        },
        ticks: {
          color: "#cbd5e1",
          maxTicksLimit: 5,
          font: { size: 10 },
        },
      },
    },
  } as const;

  const priceDiff = current !== null && prev !== null ? current - prev : 0;

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-2 flex flex-col items-center max-h-[250px] ">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base font-semibold text-white">BTC/USDT</span>
        <span className={`text-base font-bold ${priceDiff > 0 ? 'text-green-400' : priceDiff < 0 ? 'text-red-400' : 'text-gray-100'}`}>{current !== null ? current.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '--'}</span>
      </div>
      <Line data={chartData} options={chartOptions} height={180} />
      <MarketStatsTable
        min={min}
        max={max}
        avg={avg}
        min5={min5}
        max5={max5}
        min15={min15}
        max15={max15}
        volume={volume}
      />
    </div>
  );
}
