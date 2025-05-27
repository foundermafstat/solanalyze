'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type ChartData = {
  time: number;
  price: number;
};

export default function LiveChart() {
  const [connected, setConnected] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('BTC-USDT');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateTimeRef = useRef<number>(0); // Track last update time for rate limiting
  const socketRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Connection management
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<number>(Date.now());
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Список популярных инструментов для выбора
  const instruments = [
    'BTC-USDT',
    'ETH-USDT',
    'SOL-USDT',
    'XRP-USDT',
    'DOT-USDT'
  ];
  
  // Clean up all resources and connections
  const cleanupResources = useCallback(() => {
    // Clear all intervals
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
    
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // Close WebSocket if open
    if (socketRef.current && socketRef.current.readyState < 2) {
      try {
        socketRef.current.close();
      } catch (e) {
        console.error('Ошибка при закрытии WebSocket:', e);
      } finally {
        socketRef.current = null;
      }
    }
  }, []);
  
  // Инициализация начальных данных для выбранного инструмента
  const initializeData = useCallback(() => {
    let basePrice: number;
    // Устанавливаем реальные цены для каждого инструмента
    switch (selectedInstrument.split('-')[0]) {
      case 'BTC': basePrice = 105000; break;
      case 'ETH': basePrice = 3500; break;
      case 'SOL': basePrice = 180; break;
      case 'XRP': basePrice = 1.6; break;
      case 'DOT': basePrice = 15; break;
      default: basePrice = 100;
    }
    
    // Генерируем начальные точки для графика
    const now = Date.now();
    const initialData: ChartData[] = [];
    
    for (let i = 0; i < 5; i++) {
      const variance = (Math.random() - 0.5) * 0.002 * basePrice;
      initialData.push({
        time: now - (5 - i) * 5000,
        price: basePrice + variance
      });
    }
    
    return { data: initialData, price: basePrice };
  };

  // Подключение к WebSocket
  useEffect(() => {
    // Сбрасываем состояние при смене инструмента
    setConnected(false);
    setError(null);
    
    // Инициализируем данные для выбранного инструмента
    const { data, price } = initializeData();
    setChartData(data);
    setCurrentPrice(price);
    
    // Функция для подключения к WebSocket
    try {
      // Отключаем предыдущее соединение, если оно существует
      if (socketRef.current && socketRef.current.readyState < 2) {
        socketRef.current.close();
      }
      
      // Подключаемся к нашему WebSocket прокси на сервере
      const wsUrl = `ws://localhost:3001/ws/okx?instId=${selectedInstrument}`;
      console.log("WebSocket подключение к " + wsUrl);
      
      // Создаем новое соединение с WebSocket сервером
      socketRef.current = new WebSocket(wsUrl);

        // Обработчик открытия соединения
        socketRef.current.onopen = () => {
          console.log('WebSocket соединение установлено');
          setConnected(true);
          setError(null);
          
          // Подписываемся на тикеры выбранного инструмента
          const subscribeMessage = {
            op: 'subscribe',
            args: [{
              channel: 'tickers',
              instId: selectedInstrument
            }]
          };
          
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(subscribeMessage));
          }
        };

        // Обработчик ошибок
        socketRef.current.onerror = (err) => {
          console.error('Ошибка WebSocket соединения:', err);
          const errorJson = JSON.stringify(err, Object.getOwnPropertyNames(err));
          console.error('Детали ошибки:', errorJson);
          setError(`Ошибка подключения к серверу данных. Используем демо-данные.`);
          setConnected(false);
          
          // Активируем демо режим при ошибке подключения
          const initialPrice = 30000 + Math.random() * 1000;
          let lastPrice = initialPrice;
          const demoInterval = setInterval(() => {
            const newPrice = lastPrice * (1 + (Math.random() - 0.5) * 0.0005); // Меньшая амплитуда
            lastPrice = newPrice;
            const timestamp = new Date().getTime();
            
            setCurrentPrice(newPrice);
            
            // Аналогичная логика для обработчика ошибок
            setChartData(prevData => {
              if (prevData.length === 0) {
                return [{ time: timestamp - 1000, price: newPrice * 0.9999 }, { time: timestamp, price: newPrice }];
              } else {
                const lastPoint = prevData[prevData.length - 1];
                return [lastPoint, { time: timestamp, price: newPrice }];
              }
            });
          }, 1000);
          
          // Сохраняем интервал для очистки при размонтировании
          return () => clearInterval(demoInterval);
        };

        // Обработчик закрытия соединения
        socketRef.current.onclose = (event) => {
          console.log('WebSocket соединение закрыто. Код: ' + event.code + ', Причина: ' + event.reason);
          setConnected(false);
        };

        // Обработчик входящих сообщений
        socketRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Обрабатываем сообщения с данными тикеров
            if (message.data && message.arg && message.arg.channel === 'tickers') {
              const now = Date.now();
              
              // Rate limiting: process only one update per second
              if (now - lastUpdateTimeRef.current < 1000) {
                return; // Skip this update if less than 1 second has passed
              }
              
              lastUpdateTimeRef.current = now; // Update last processed time
              
              const ticker = message.data[0];
              const price = Number.parseFloat(ticker.last);
              const timestamp = now;
              
              // Update current price
              setCurrentPrice(price);
              
              // Add new data point for the chart
              setChartData(prevData => {
                const newData = [...prevData, { time: timestamp, price }];
                
                // Ограничиваем количество точек данных, чтобы не перегружать память
                if (newData.length > 100) {
                  return newData.slice(-100);
                }
                return newData;
              });
            }
          } catch (err) {
            console.error('Ошибка при обработке сообщения WebSocket:', err);
          }
        };
      } catch (err) {
        console.error('Ошибка при создании WebSocket соединения:', err);
        setError('Не удалось подключиться к серверу данных');
        setConnected(false);
      }
    }

    // Очищаем ресурсы при размонтировании
    return () => {
      // Закрываем WebSocket соединение
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [selectedInstrument]); // Переподключаемся при изменении инструмента

  // Рисуем график
  useEffect(() => {
    if (!canvasRef.current || chartData.length < 2) return;
    
    console.log('Обновление графика с данными:', chartData.length, 'точек');

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Устанавливаем размеры canvas в соответствии с его фактическими размерами в DOM
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Очищаем холст
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Находим минимальное и максимальное значения цены для масштабирования
    // Устанавливаем фиксированный диапазон цен, чтобы избежать резких скачков масштаба
    const currentPrice = chartData[chartData.length - 1].price;
    const minPrice = currentPrice * 0.9995;
    const maxPrice = currentPrice * 1.0005;
    const priceRange = maxPrice - minPrice;

    // Находим минимальное и максимальное значения времени
    const minTime = chartData[0].time;
    const maxTime = chartData[chartData.length - 1].time;
    const timeRange = maxTime - minTime;

    // Настраиваем стиль линии
    context.lineWidth = 2;
    context.strokeStyle = '#3b82f6'; // Синий цвет
    
    // Рисуем фон
    context.fillStyle = '#f9fafb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сетку
    context.beginPath();
    context.strokeStyle = '#e5e7eb'; // Светло-серый цвет
    context.lineWidth = 1;
    
    // Горизонтальные линии сетки
    const gridRows = 5;
    for (let i = 0; i <= gridRows; i++) {
      const y = canvas.height - (i / gridRows) * canvas.height;
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    
    // Вертикальные линии сетки
    const gridCols = 6;
    for (let i = 0; i <= gridCols; i++) {
      const x = (i / gridCols) * canvas.width;
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }
    
    context.stroke();
    
    // Рисуем линию цены
    context.beginPath();
    context.strokeStyle = '#3b82f6'; // Синий цвет
    context.lineWidth = 2;
    
    // Начинаем путь с первой точки
    const firstPoint = chartData[0];
    const firstX = ((firstPoint.time - minTime) / timeRange) * canvas.width;
    const firstY = canvas.height - ((firstPoint.price - minPrice) / priceRange) * canvas.height;
    context.moveTo(firstX, firstY);
    
    // Продолжаем путь через все остальные точки
    for (let i = 1; i < chartData.length; i++) {
      const point = chartData[i];
      const x = ((point.time - minTime) / timeRange) * canvas.width;
      const y = canvas.height - ((point.price - minPrice) / priceRange) * canvas.height;
      context.lineTo(x, y);
    }
    
    context.stroke();
    
    // Добавляем заполнение под линией
    context.lineTo(((chartData[chartData.length - 1].time - minTime) / timeRange) * canvas.width, canvas.height);
    context.lineTo(firstX, canvas.height);
    context.closePath();
    context.fillStyle = 'rgba(59, 130, 246, 0.1)';
    context.fill();
    
    // Рисуем ценовую шкалу
    context.fillStyle = '#374151';
    context.font = '12px sans-serif';
    context.textAlign = 'left';
    
    for (let i = 0; i <= gridRows; i++) {
      const price = minPrice + (i / gridRows) * priceRange;
      const y = canvas.height - (i / gridRows) * canvas.height;
      context.fillText(price.toFixed(2), 5, y - 5);
    }
    
  }, [chartData, canvasRef]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">График в реальном времени</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Инструмент:</span>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded text-sm"
          >
            {instruments.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
          <div className={`ml-2 h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
      </div>
      
      {currentPrice && (
        <div className="mb-4 flex items-center">
          <span className="text-2xl font-bold">{currentPrice.toFixed(2)}</span>
          <span className="text-sm text-gray-500 ml-2">USDT</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}
      
      <div className="h-64 w-full">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full" 
        />
      </div>
      
      <p className="mt-4 text-xs text-gray-500 text-center">
        Данные обновляются в реальном времени через WebSocket соединение
      </p>
    </div>
  );
}
