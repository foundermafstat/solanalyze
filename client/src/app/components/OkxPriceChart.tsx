'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PriceData {
  time: number;
  price: number;
}

export default function OkxPriceChart({ symbol = 'BTC-USDT' }) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 2000; // 2 seconds

  // Generate initial data for the chart
  const generateInitialData = useCallback(() => {
    const now = Date.now();
    const data: PriceData[] = [];
    
    // Initial price for different cryptocurrencies
    let basePrice = 0;
    switch (symbol.split('-')[0]) {
      case 'BTC': basePrice = 105000; break;
      case 'ETH': basePrice = 3500; break;
      case 'SOL': basePrice = 180; break;
      case 'XRP': basePrice = 1.6; break;
      case 'DOT': basePrice = 15; break;
      default: basePrice = 100;
    }
    
    // Create 10 empty data points for initial display
    for (let i = 0; i < 10; i++) {
      // Random price deviation within 0.5%
      const variance = (Math.random() - 0.5) * 0.01 * basePrice;
      data.push({
        time: now - (10 - i) * 10000, // Every 10 seconds
        price: basePrice + variance
      });
    }
    
    return data;
  }, [symbol]);

  // Clean up WebSocket and intervals
  const cleanupResources = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (wsRef.current && wsRef.current.readyState < 2) {
      try {
        wsRef.current.close();
      } catch (err) {
        console.error('Ошибка при закрытии WebSocket:', err);
      } finally {
        wsRef.current = null;
      }
    }
  }, []);

  // Connection state management
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const lastMessageTimeRef = useRef<number>(Date.now());
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket with enhanced reliability
  const connectWebSocket = useCallback(() => {
    // Prevent simultaneous connection attempts
    if (connectionState === 'connecting' || connectionState === 'reconnecting') {
      console.log('WebSocket connection already in progress, skipping');
      return;
    }
    
    // Clean up any existing connections first
    cleanupResources();
    
    // Update connection state
    setConnectionState(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');
    
    try {
      // Connect to local WebSocket proxy
      const wsPath = `/api/ws?instId=${symbol}`;
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}${wsPath}`;
      console.log(`Попытка подключения к WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Set connection timeout
      const connectionTimeoutId = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout - forcing reconnect');
          if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
            ws.close();
          }
        }
      }, 10000); // 10 second connection timeout
      
      // Set up event handlers
      ws.onopen = () => {
        clearTimeout(connectionTimeoutId);
        console.log('WebSocket соединение установлено');
        setIsConnected(true);
        setConnectionState('connected');
        lastMessageTimeRef.current = Date.now();
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        
        // Subscribe to ticker updates
        const subscribeMsg = JSON.stringify({
          op: 'subscribe',
          args: [{
            channel: 'tickers',
            instId: symbol
          }]
        });
        console.log('Отправка сообщения подписки:', subscribeMsg);
        ws.send(subscribeMsg);
        
        // Set up ping interval to keep connection alive
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ op: 'ping' }));
            } catch (sendError) {
              console.error('Ошибка при отправке ping:', sendError);
              // Force reconnection if ping fails
              if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
                ws.close();
              }
            }
          }
        }, 15000); // Send ping every 15 seconds
        
        // Set up health check to detect stale connections
        if (healthCheckIntervalRef.current) clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = setInterval(() => {
          const now = Date.now();
          const timeSinceLastMessage = now - lastMessageTimeRef.current;
          
          // If no message for 45 seconds (3x the ping interval), force reconnect
          if (timeSinceLastMessage > 45000 && ws.readyState === WebSocket.OPEN) {
            console.log(`No messages received for ${timeSinceLastMessage}ms, forcing reconnect`);
            ws.close();
          }
        }, 10000); // Check health every 10 seconds
      };
      
      ws.onmessage = (event) => {
        // Update last message time on any message
        lastMessageTimeRef.current = Date.now();
        
        try {
          const message = JSON.parse(event.data);
          
          // Handle pong responses
          if (message.event === 'pong') {
            return; // Silently process pongs
          }
          
          if (message.data && message.arg?.channel === 'tickers') {
            const ticker = message.data[0];
            const price = Number(ticker.last);
            const time = Date.now();
            
            setCurrentPrice(price);
            
            setPriceData(prev => {
              const newData = [...prev, { time, price }];
              return newData.length > 50 ? newData.slice(-50) : newData;
            });
          }
        } catch (err) {
          console.error('Ошибка при обработке сообщения:', err);
        }
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectionTimeoutId);
        console.log(`WebSocket соединение закрыто, код: ${event.code}`);
        setIsConnected(false);
        setConnectionState('disconnected');
        
        // Clean up ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Clean up health check interval
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
          healthCheckIntervalRef.current = null;
        }
        
        // Don't reconnect on normal closure (code 1000) if initiated by the client
        const isNormalClosure = event.code === 1000 && event.wasClean;
        if (isNormalClosure && wsRef.current === null) {
          console.log('Normal closure detected, not reconnecting');
          return;
        }
        
        // Exponential backoff reconnection with a more robust strategy
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          // Calculate delay with jitter to prevent thundering herd problem
          const baseDelay = Math.min(30000, baseReconnectDelay * (1.5 ** reconnectAttemptsRef.current));
          const jitter = Math.random() * 1000; // Add random jitter up to 1 second
          const delay = baseDelay + jitter;
          
          console.log(`Попытка переподключения ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts} через ${delay}ms`);
          reconnectAttemptsRef.current++;
          
          // Use setTimeout with the calculated delay
          setTimeout(() => {
            if (document.visibilityState !== 'hidden') {
              connectWebSocket();
            } else {
              // If tab is not visible, wait until it becomes visible
              const visibilityHandler = () => {
                if (document.visibilityState !== 'hidden') {
                  document.removeEventListener('visibilitychange', visibilityHandler);
                  connectWebSocket();
                }
              };
              document.addEventListener('visibilitychange', visibilityHandler);
            }
          }, delay);
        } else {
          console.error(`Превышено максимальное количество попыток переподключения (${maxReconnectAttempts})`);
          // Reset attempts after a longer delay to eventually try again
          setTimeout(() => {
            reconnectAttemptsRef.current = 0;
            connectWebSocket();
          }, 60000); // Wait 1 minute before resetting
        }
      };
      
      ws.onerror = (err) => {
        // Define type for error info
        type WebSocketErrorInfo = {
          error: Event;
          timestamp: string;
          readyState?: number;
          url?: string;
        };
        
        const errorInfo: WebSocketErrorInfo = {
          error: err,
          timestamp: new Date().toISOString()
        };
        
        // Add WebSocket info if available
        if (wsRef.current) {
          errorInfo.readyState = wsRef.current.readyState;
          errorInfo.url = wsRef.current.url;
        }
        
        console.error('Ошибка WebSocket:', errorInfo);
        setIsConnected(false);
        
        // The onclose handler will automatically try to reconnect
        // Don't call close() here as it will be automatically triggered
      };
    } catch (err) {
      console.error('Ошибка при создании WebSocket:', err);
      setIsConnected(false);
      setConnectionState('disconnected');
      
      // Try to reconnect after error in creation
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(30000, baseReconnectDelay * (1.5 ** reconnectAttemptsRef.current));
        console.log(`Планируем переподключение через ${delay}мс`);
        reconnectAttemptsRef.current++;
        setTimeout(connectWebSocket, delay);
      } else {
        // Reset attempts after a longer delay to eventually try again
        setTimeout(() => {
          reconnectAttemptsRef.current = 0;
          connectWebSocket();
        }, 60000); // Wait 1 minute before resetting
      }
    }
  }, [symbol, cleanupResources, connectionState]);

  // Initial connection and cleanup effect
  useEffect(() => {
    console.log('Инициализация WebSocket подключения для символа:', symbol);
    
    // Reset state
    setPriceData([]);
    setCurrentPrice(null);
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
    
    // If no data, create initial points for the chart
    setPriceData(generateInitialData());
    
    // Establish connection
    connectWebSocket();
    
    // Cleanup resources on unmount
    return cleanupResources;
  }, [symbol, generateInitialData, connectWebSocket, cleanupResources]);

  // Draw chart effect
  useEffect(() => {
    if (!canvasRef.current || priceData.length < 2) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Define padding for the chart
    const padding = { top: 10, right: 10, bottom: 20, left: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Find min/max values for scaling
    const prices = priceData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.9995;
    const maxPrice = Math.max(...prices) * 1.0005;
    const priceRange = maxPrice - minPrice;
    
    const times = priceData.map(d => d.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1; // avoid division by zero
    
    // Draw grid
    ctx.strokeStyle = '#edf2f7';
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    const priceStep = priceRange / 4;
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + i * priceStep;
      const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Add price on Y axis
      ctx.fillStyle = '#718096';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // Different number of decimal places depending on price magnitude
      const digits = price < 1 ? 4 : price < 10 ? 2 : price < 1000 ? 1 : 0;
      ctx.fillText(price.toFixed(digits), padding.left - 5, y);
    }
    
    // Draw chart line
    ctx.strokeStyle = '#3b82f6'; // Blue color
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    priceData.forEach((point, i) => {
      const x = padding.left + ((point.time - minTime) / timeRange) * chartWidth;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Add gradient fill under the graph
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    ctx.fillStyle = gradient;
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fill();
  }, [priceData]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{symbol}</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">{isConnected ? 'Онлайн' : 'Подключение...'}</span>
        </div>
      </div>
      
      {currentPrice && (
        <div className="text-3xl font-bold mb-4">
          {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          <span className="text-sm text-gray-500 ml-1">USDT</span>
        </div>
      )}
      
      <div className="h-40 w-full border border-gray-100 rounded">
        {priceData.length > 1 ? (
          <canvas ref={canvasRef} className="w-full h-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            Ожидание данных...
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-400 text-right">
        Данные получены через OKX WebSocket API
      </div>
    </div>
  );
}
