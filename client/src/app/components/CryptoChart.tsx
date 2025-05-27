'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CryptoChartProps {
  symbol?: string;
}

export default function CryptoChart({ symbol = 'BTC-USDT' }: CryptoChartProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Устанавливаем флаг, что мы на клиенте, чтобы избежать проблем с гидратацией
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="h-96 w-full bg-gray-100 animate-pulse rounded-lg" />;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Профессиональный график</h2>
        <div className="text-sm text-gray-500">{symbol}</div>
      </div>
      
      <div className="h-96 w-full">
        {isClient && <SimpleCryptoChart symbol={symbol} />}
      </div>
      
      <p className="mt-4 text-xs text-gray-500 text-center">
        Расширенный график с интерактивными элементами
      </p>
    </div>
  );
}



// Простой график на Canvas
function SimpleCryptoChart({ symbol }: { symbol: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [priceData, setPriceData] = useState<{time: number, price: number}[]>([]);
  
  // Генерируем демо-данные для графика
  useEffect(() => {
    // Сбрасываем данные при изменении символа
    setPriceData([]);
    
    const generateData = () => {
      // Начинаем с разумной цены в зависимости от символа
      let basePrice: number;
      switch (symbol.split('-')[0]) {
        case 'BTC': basePrice = 30000 + Math.random() * 2000; break;
        case 'ETH': basePrice = 2000 + Math.random() * 200; break;
        case 'SOL': basePrice = 100 + Math.random() * 20; break;
        case 'XRP': basePrice = 0.5 + Math.random() * 0.1; break;
        case 'DOT': basePrice = 10 + Math.random() * 2; break;
        default: basePrice = 100 + Math.random() * 50;
      }
      
      // Генерируем исторические данные
      const now = Date.now();
      const historicalData: {time: number, price: number}[] = [];
      
      // Генерируем 100 точек данных с интервалом в 15 минут
      for (let i = 0; i < 100; i++) {
        const time = now - (99 - i) * 15 * 60 * 1000; // 15 минут назад
        // Добавляем случайные изменения, имитирующие реальный график
        const randomChange = (Math.random() - 0.5) * 0.01; // ±0.5%
        // Добавляем тренд, чтобы график выглядел более реалистично
        const trendChange = Math.sin(i / 10) * 0.005; // Синусоидальный тренд
        
        const priceChange = basePrice * (randomChange + trendChange);
        basePrice += priceChange;
        
        historicalData.push({ time, price: basePrice });
      }
      
      setPriceData(historicalData);
    };
    
    generateData();
    
    // Имитируем обновления в реальном времени
    const interval = setInterval(() => {
      setPriceData(prev => {
        if (prev.length === 0) return prev;
        
        const lastPrice = prev[prev.length - 1].price;
        const time = Date.now();
        const randomChange = (Math.random() - 0.5) * 0.005; // ±0.25%
        const newPrice = lastPrice * (1 + randomChange);
        
        // Добавляем новую точку и удаляем самую старую
        const newData = [...prev.slice(1), { time, price: newPrice }];
        return newData;
      });
    }, 5000); // Обновляем каждые 5 секунд
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  // Рисуем график
  useEffect(() => {
    if (!canvasRef.current || priceData.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Устанавливаем размеры canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Устанавливаем отступы
    const padding = { top: 30, right: 20, bottom: 30, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    
    // Находим мин/макс значения для маcштабирования
    const minPrice = Math.min(...priceData.map(d => d.price)) * 0.9995;
    const maxPrice = Math.max(...priceData.map(d => d.price)) * 1.0005;
    const minTime = priceData[0].time;
    const maxTime = priceData[priceData.length - 1].time;
    
    // Рисуем фон
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сетку
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Горизонтальные линии
    const priceStep = (maxPrice - minPrice) / 5;
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + i * priceStep;
      const y = padding.top + chartHeight - (chartHeight * (price - minPrice) / (maxPrice - minPrice));
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Добавляем метки цены
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(price.toFixed(2), padding.left - 5, y);
    }
    
    // Вертикальные линии (метки времени)
    const timeStep = (maxTime - minTime) / 6;
    for (let i = 0; i <= 6; i++) {
      const time = minTime + i * timeStep;
      const x = padding.left + (chartWidth * (time - minTime) / (maxTime - minTime));
      
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
      
      // Добавляем метки времени
      if (i % 2 === 0) { // Отображаем только каждую вторую метку для экономии места
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const timeLabel = `${hours}:${minutes}`;
        
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(timeLabel, x, padding.top + chartHeight + 5);
      }
    }
    
    // Рисуем линию цены
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Проходим по всем точкам данных
    priceData.forEach((point, index) => {
      const x = padding.left + (chartWidth * (point.time - minTime) / (maxTime - minTime));
      const y = padding.top + chartHeight - (chartHeight * (point.price - minPrice) / (maxPrice - minPrice));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Добавляем заливку под линией
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fill();
    
    // Добавляем заголовок графика
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(symbol, padding.left, 10);
    
    // Добавляем текущую цену
    const currentPrice = priceData[priceData.length - 1].price;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${currentPrice.toFixed(2)} USDT`, padding.left + chartWidth, 10);
    
  }, [priceData, symbol]); // Добавлен symbol как зависимость для корректного обновления
  
  return (
    <div className="h-full w-full relative rounded-lg overflow-hidden border border-gray-100">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-0 right-0 p-1 text-xs text-gray-400 bg-white bg-opacity-70 rounded-bl">
        Расширенный график для {symbol}
      </div>
    </div>
  );
}


