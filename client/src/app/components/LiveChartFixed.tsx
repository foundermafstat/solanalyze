'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [reconnectCount, setReconnectCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Список инструментов для выбора
  const instruments = [
    'BTC-USDT',
    'ETH-USDT',
    'SOL-USDT',
    'XRP-USDT',
    'DOT-USDT'
  ];

  // Инициализация начальных данных с реальными ценами
  const initializeData = useCallback(() => {
    let basePrice: number;
    switch (selectedInstrument.split('-')[0]) {
      case 'BTC': basePrice = 105000; break;
      case 'ETH': basePrice = 3500; break;
      case 'SOL': basePrice = 180; break;
      case 'XRP': basePrice = 1.6; break;
      case 'DOT': basePrice = 15; break;
      default: basePrice = 100;
    }
    
    const now = Date.now();
    const initialData: ChartData[] = [];
    
    for (let i = 0; i < 5; i++) {
      const variance = (Math.random() - 0.5) * 0.002 * basePrice;
      initialData.push({
        time: now - (5 - i) * 5000,
        price: basePrice + variance
      });
    }
    
    setChartData(initialData);
    setCurrentPrice(basePrice);
    
    return { data: initialData, price: basePrice };
  }, [selectedInstrument]);

  // Очистка таймера переподключения
  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);
  
  // WebSocket подключение и обработка данных
  const connectWebSocket = useCallback(() => {
    // Очищаем таймер переподключения
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    // Сбрасываем состояние
    setConnected(false);
    if (reconnectCount > 0) {
      setError(`Попытка переподключения ${reconnectCount}/5...`);
    } else {
      setError(null);
    }
    
    // Закрываем предыдущее соединение
    if (socketRef.current && socketRef.current.readyState < 2) {
      socketRef.current.close();
    }
    
    try {
      // Динамически определяем серверный URL и порт
      // Используем текущий хост и порт для определения WebSocket URL
      const host = window.location.hostname;
      const serverPort = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      
      // Подключаемся к WebSocket прокси
      const wsUrl = `ws://${host}:${serverPort}/ws?instId=${selectedInstrument}`;
      console.log(`Подключение к WebSocket прокси: ${wsUrl}`);
      
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log("WebSocket соединение установлено");
        setConnected(true);
        setError(null);
        
        // Добавляем задержку перед отправкой подписки,
        // чтобы дать время серверу установить соединение с OKX
        setTimeout(() => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            // Подписываемся на данные
            const subscribeMsg = {
              op: 'subscribe',
              args: [{
                channel: 'tickers',
                instId: selectedInstrument
              }]
            };
            
            try {
              console.log('Отправка запроса на подписку:', subscribeMsg);
              socketRef.current.send(JSON.stringify(subscribeMsg));
            } catch (error) {
              console.error('Ошибка при отправке запроса на подписку:', error);
              setError('Ошибка при отправке запроса на подписку');
            }
          }
        }, 2000); // Даем 2 секунды на установку соединения с OKX
      };
      
      socketRef.current.onerror = (err) => {
        console.error("Ошибка WebSocket:", err);
        setConnected(false);
        setError(`Ошибка соединения с сервером${reconnectCount > 0 ? ` (попытка ${reconnectCount}/5)` : ''}`);
      };
      
      socketRef.current.onclose = () => {
        setConnected(false);
        
        // Автоматическое переподключение при обрыве связи
        // Максимум 5 попыток с экспоненциальной задержкой
        if (reconnectCount < 5) {
          const delay = Math.min(1000 * (2 ** reconnectCount), 30000); // От 1с до 30с максимум
          console.log(`Попытка переподключения через ${delay / 1000} с`);
          
          setError(`Соединение потеряно. Попытка переподключения ${reconnectCount + 1}/5 через ${delay / 1000} с...`);
          
          reconnectTimerRef.current = setTimeout(() => {
            setReconnectCount(prevCount => prevCount + 1);
            connectWebSocket();
          }, delay);
        } else {
          setError("Не удалось подключиться к серверу после нескольких попыток. Пожалуйста, обновите страницу.");
        }
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Обрабатываем сообщения о статусе от сервера
          if (message.event === 'pong') {
            console.log('Получен pong от сервера');
            return;
          }
          
          // Обрабатываем сообщения об ошибках
          if (message.error) {
            console.error(`Ошибка от сервера: ${message.error}`);
            setError(message.error);
            return;
          }
          
          // Обрабатываем статус подключения
          if (message.event === 'connected') {
            console.log('Успешное подключение к WebSocket серверу');
            setError(null);
            return;
          }
          
          // Обрабатываем данные тикера
          if (message.data && message.arg?.channel === 'tickers') {
            const ticker = message.data[0];
            const price = Number(ticker.last);
            const time = Date.now();
            
            // Проверяем, что цена не нулевая и не NaN
            if (price && !Number.isNaN(price)) {
              console.log(`Получена цена ${price} для ${message.arg.instId}`);
              setCurrentPrice(price);
              
              setChartData(prev => {
                const newData = [...prev, { time, price }];
                return newData.length > 100 ? newData.slice(-100) : newData;
              });
            }
          }
        } catch (err) {
          console.error("Ошибка при обработке сообщения:", err);
          console.log('Сырые данные:', event.data);
        }
      };
    } catch (err) {
      console.error("Ошибка при создании WebSocket:", err);
      setError("Не удалось установить соединение");
    }
    
    // Очищаем ресурсы
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [selectedInstrument, reconnectCount]);

  // Инициализация данных при изменении инструмента
  useEffect(() => {
    // Сбрасываем счетчик переподключений при смене инструмента
    setReconnectCount(0);
    
    // Инициализируем данные
    initializeData();
    
    // Очищаем таймер переподключения и пробуем подключиться
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    connectWebSocket();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [initializeData, connectWebSocket]);

  // Отправляем ping каждые 30 секунд для поддержания соединения
  useEffect(() => {
    if (!socketRef.current || !connected) return;
    
    // Устанавливаем интервал ping для поддержания соединения
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({ op: 'ping', ts: Date.now() }));
          console.log('Отправлен ping на сервер');
        } catch (err) {
          console.error('Ошибка при отправке ping:', err);
        }
      }
    }, 30000);
    
    // При успешном подключении сбрасываем счетчик переподключений
    if (connected && reconnectCount > 0) {
      setReconnectCount(0);
    }
    
    return () => clearInterval(pingInterval);
  }, [connected, reconnectCount]);

  // Отрисовка графика
  useEffect(() => {
    if (!canvasRef.current || chartData.length < 2) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Устанавливаем размеры canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Находим мин/макс для масштабирования
    const minPrice = Math.min(...chartData.map(d => d.price)) * 0.9995;
    const maxPrice = Math.max(...chartData.map(d => d.price)) * 1.0005;
    const priceRange = maxPrice - minPrice;
    
    const minTime = Math.min(...chartData.map(d => d.time));
    const maxTime = Math.max(...chartData.map(d => d.time));
    const timeRange = maxTime - minTime;
    
    // Рисуем фон
    context.fillStyle = '#f9fafb';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сетку
    context.beginPath();
    context.strokeStyle = '#e5e7eb';
    context.lineWidth = 1;
    
    // Горизонтальные линии
    const gridRows = 5;
    for (let i = 0; i <= gridRows; i++) {
      const y = canvas.height - (i / gridRows) * canvas.height;
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    
    // Вертикальные линии
    const gridCols = 6;
    for (let i = 0; i <= gridCols; i++) {
      const x = (i / gridCols) * canvas.width;
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    }
    
    context.stroke();
    
    // Рисуем линию графика
    context.beginPath();
    context.strokeStyle = '#3b82f6';
    context.lineWidth = 2;
    
    // Начинаем с первой точки
    const firstPoint = chartData[0];
    const firstX = ((firstPoint.time - minTime) / timeRange) * canvas.width;
    const firstY = canvas.height - ((firstPoint.price - minPrice) / priceRange) * canvas.height;
    context.moveTo(firstX, firstY);
    
    // Добавляем остальные точки
    for (let i = 1; i < chartData.length; i++) {
      const point = chartData[i];
      const x = ((point.time - minTime) / timeRange) * canvas.width;
      const y = canvas.height - ((point.price - minPrice) / priceRange) * canvas.height;
      context.lineTo(x, y);
    }
    
    context.stroke();
    
    // Добавляем заливку
    context.lineTo(((chartData[chartData.length - 1].time - minTime) / timeRange) * canvas.width, canvas.height);
    context.lineTo(firstX, canvas.height);
    context.closePath();
    context.fillStyle = 'rgba(59, 130, 246, 0.1)';
    context.fill();
    
    // Добавляем цены на шкале
    context.fillStyle = '#374151';
    context.font = '12px sans-serif';
    context.textAlign = 'left';
    
    for (let i = 0; i <= gridRows; i++) {
      const price = minPrice + (i / gridRows) * priceRange;
      const y = canvas.height - (i / gridRows) * canvas.height;
      context.fillText(price.toFixed(2), 5, y - 5);
    }
  }, [chartData]);

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
