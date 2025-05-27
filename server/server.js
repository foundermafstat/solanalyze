// Enable source map support for better error stack traces
require('source-map-support').install();

// Load environment variables first
require('dotenv').config();

// Enable debug logging
process.env.DEBUG = 'server:*';
const debug = require('debug')('server:main');
const debugWs = require('debug')('server:websocket');
const debugApi = require('debug')('server:api');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('node:path');
const WebSocket = require('ws');
const http = require('node:http');

// Initialize OKX client with error handling
let okx;
try {
  okx = require('./lib/index');
  debug('OKX client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OKX client:', error);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware для логирования запросов и CORS
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Расширенное логирование запросов и ответов
app.use((req, res, next) => {
  // Генерируем уникальный ID для каждого запроса
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Логирование запроса
  const requestStartTime = new Date();
  console.log('\n--------------------------------------------------');
  console.log(`📥 ЗАПРОС [${requestId}] ${new Date().toISOString()}`);
  console.log(`${req.method} ${req.originalUrl}`);
  console.log('Заголовки:', JSON.stringify(req.headers, null, 2));
  
  // Проверяем наличие тела запроса перед вызовом Object.keys()
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('Тело запроса:', JSON.stringify(req.body, null, 2));
  }
  
  // Сохраняем оригинальный метод res.send
  const originalSend = res.send;
  
  // Переопределяем метод send
  res.send = function(body) {
    // Логирование ответа
    const responseTime = new Date() - requestStartTime;
    console.log(`📤 ОТВЕТ [${requestId}] ${new Date().toISOString()} (${responseTime} мс)`);
    console.log(`Статус: ${res.statusCode}`);
    
    // Если ответ в формате JSON, логируем его содержимое
    try {
      const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
      
      // Для больших объектов ответа выводим только часть и общий размер
      const stringifiedResponse = JSON.stringify(responseBody);
      if (stringifiedResponse.length > 1000) {
        console.log(`Тело ответа (${stringifiedResponse.length} байт): ${JSON.stringify(responseBody, null, 2).substring(0, 1000)}...`);
        console.log(`[обрезано, полный размер: ${stringifiedResponse.length} байт]`);
      } else {
        console.log('Тело ответа:', JSON.stringify(responseBody, null, 2));
      }
    } catch (e) {
      // Если не JSON, логируем как есть
      if (typeof body === 'string') {
        if (body.length > 500) {
          console.log(`Тело ответа (${body.length} байт): ${body.substring(0, 500)}...`);
          console.log(`[обрезано, полный размер: ${body.length} байт]`);
        } else {
          console.log(`Тело ответа: ${body}`);
        }
      } else {
        console.log('Тело ответа:', body);
      }
    }
    
    console.log('--------------------------------------------------\n');
    
    // Вызываем оригинальный метод send
    return originalSend.call(this, body);
  };
  
  next();
});

// Next.js will handle the frontend, so we don't serve static files here

// Функция для получения всех эндпоинтов проекта
const getAllEndpoints = () => {
  // Извлекаем эндпоинты из REST клиента
  const restEndpoints = [
    // Эндпоинты аккаунта
    {
      name: 'getAccountInstruments',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/instruments',
    },
    {
      name: 'getBalance',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/balance',
    },
    {
      name: 'getPositions',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/positions',
    },
    {
      name: 'getPositionsHistory',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/positions-history',
    },
    {
      name: 'getAccountPositionRisk',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/account-position-risk',
    },
    {
      name: 'getBills',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/bills',
    },
    {
      name: 'getBillsArchive',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/bills-archive',
    },
    {
      name: 'getAccountConfiguration',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/account/config',
    },

    // Эндпоинты торговли
    {
      name: 'submitOrder',
      auth: true,
      method: 'POST',
      endpoint: '/api/v5/trade/order',
    },
    {
      name: 'submitMultipleOrders',
      auth: true,
      method: 'POST',
      endpoint: '/api/v5/trade/batch-orders',
    },
    {
      name: 'cancelOrder',
      auth: true,
      method: 'POST',
      endpoint: '/api/v5/trade/cancel-order',
    },
    {
      name: 'cancelMultipleOrders',
      auth: true,
      method: 'POST',
      endpoint: '/api/v5/trade/cancel-batch-orders',
    },
    {
      name: 'amendOrder',
      auth: true,
      method: 'POST',
      endpoint: '/api/v5/trade/amend-order',
    },
    {
      name: 'getOrderDetails',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/trade/order',
    },
    {
      name: 'getOrderList',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/trade/orders-pending',
    },
    {
      name: 'getOrderHistory',
      auth: true,
      method: 'GET',
      endpoint: '/api/v5/trade/orders-history',
    },

    // Маркет данные
    {
      name: 'getMarketTickers',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/tickers',
    },
    {
      name: 'getMarketTicker',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/ticker',
    },
    {
      name: 'getMarketIndexTickers',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/index-tickers',
    },
    {
      name: 'getMarketBooks',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/books',
    },
    {
      name: 'getMarketCandles',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/candles',
    },
    {
      name: 'getMarketHistoryCandles',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/history-candles',
    },
    {
      name: 'getMarketIndexCandles',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/index-candles',
    },
    {
      name: 'getMarketMarkPriceCandles',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/market/mark-price-candles',
    },

    // Публичные данные
    {
      name: 'getPublicInstruments',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/instruments',
    },
    {
      name: 'getPublicDeliveryExerciseHistory',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/delivery-exercise-history',
    },
    {
      name: 'getPublicOpenInterest',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/open-interest',
    },
    {
      name: 'getPublicFundingRate',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/funding-rate',
    },
    {
      name: 'getPublicFundingRateHistory',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/funding-rate-history',
    },
    {
      name: 'getPublicPriceLimit',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/price-limit',
    },
    {
      name: 'getPublicOptionSummary',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/opt-summary',
    },
    {
      name: 'getPublicEstimatedPrice',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/estimated-price',
    },
    {
      name: 'getPublicDiscountInfo',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/discount-rate-interest-free-quota',
    },
    {
      name: 'getPublicTime',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/time',
    },
    {
      name: 'getPublicLiquidationOrders',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/liquidation-orders',
    },
    {
      name: 'getPublicMarkPrice',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/public/mark-price',
    },

    // Системные эндпоинты
    {
      name: 'getSystemStatus',
      auth: false,
      method: 'GET',
      endpoint: '/api/v5/system/status',
    },
  ];

  // Эндпоинты, добавленные на сервере
  const serverEndpoints = [
    { name: 'getStatus', auth: false, method: 'GET', endpoint: '/api/status' },
    {
      name: 'getMarketTickers',
      auth: false,
      method: 'GET',
      endpoint: '/api/market/tickers',
    },
  ];

  return {
    rest: restEndpoints,
    server: serverEndpoints
  };
}

// Маршрут API для отображения всех эндпоинтов проекта
app.get('/api/status', async (req, res) => {
  const apiKeyStatus = await checkApiKeyStatus();
  const endpoints = getAllEndpoints();
  res.json({
    status: 'ok',
    apiKey: apiKeyStatus,
    endpoints: endpoints,
    totalEndpoints: endpoints.rest.length + endpoints.server.length,
    documentation: {
      source: 'https://github.com/tiagosiebler/okx-api',
      officialDocs: 'https://www.okx.com/docs-v5/en/'
    }
  });
});

// Эндпоинт для получения информации об инструментах
app.get('/api/public/instruments', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instType, uly, instId } = req.query;
    
    // Проверка обязательных параметров
    if (!instType) {
      return res.status(400).json({ message: 'Параметр instType обязателен' });
    }
    
    // Создаем экземпляр клиента OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Создаем параметры запроса
    const params = { instType };
    if (uly) params.uly = uly;
    if (instId) params.instId = instId;
    
    // Выполняем запрос к OKX API с правильным методом
    const response = await client.get('/api/v5/public/instruments', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении данных инструментов:', error);
    res.status(500).json({ 
      error: error.message || 'Внутренняя ошибка сервера',
      message: 'Ошибка при получении данных инструментов'
    });
  }
});

// Пример использования OKX API с аутентификацией из .env
app.get('/api/market/tickers', async (req, res) => {
  try {
    // Создаем клиент с параметрами из .env
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    const response = await client.get('/api/v5/market/tickers', { instType: 'SPOT' });
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения информации о балансе аккаунта (требует аутентификации)
app.get('/api/account/balance', async (req, res) => {
  try {
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    const response = await client.getPrivate('/api/v5/account/balance');
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения информации о ставке финансирования
app.get('/api/public/funding-rate', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instType, instId } = req.query;
    
    // Проверка обязательных параметров
    if (!instId) {
      return res.status(400).json({ message: 'Параметр instId обязателен' });
    }
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = {};
    if (instId) params.instId = instId;
    if (instType) params.instType = instType;
    
    // Выполняем запрос к API
    const response = await client.get('/api/v5/public/funding-rate', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении ставки финансирования:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения позиций аккаунта
app.get('/api/account/positions', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instType, instId, posId } = req.query;
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = {};
    if (instType) params.instType = instType;
    if (instId) params.instId = instId;
    if (posId) params.posId = posId;
    
    // Выполняем запрос к API
    const response = await client.getPrivate('/api/v5/account/positions', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении позиций:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения биллов аккаунта
app.get('/api/account/bills', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instType, ccy, type, before, after, limit } = req.query;
    
    console.log('Запрос к /api/account/bills с параметрами:', { instType, ccy, type, limit });
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = {};
    if (instType) params.instType = instType;
    if (ccy) params.ccy = ccy;
    if (type) params.type = type;
    if (before) params.before = before;
    if (after) params.after = after;
    if (limit) params.limit = limit;
    
    // Проверка API ключей и доступа
    try {
      // Выполняем проверку аутентификации
      const authCheck = await client.getPrivate('/api/v5/account/config');
      console.log('Проверка авторизации:', authCheck);
    } catch (authError) {
      console.error('Ошибка авторизации:', authError);
      return res.status(401).json({ 
        error: 'Ошибка авторизации', 
        message: authError.message,
        code: 'AUTH_ERROR'
      });
    }
    
    // Выполняем запрос к API
    const response = await client.getPrivate('/api/v5/account/bills', params);
    console.log('Ответ от OKX API:', response);
    
    // Проверяем ответ на пустоту
    if (!response || Object.keys(response).length === 0) {
      return res.json({ 
        data: [], 
        success: true, 
        message: 'Нет доступных данных по указанным параметрам' 
      });
    }
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении биллов:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении биллов', 
      message: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Маршрут для получения времени сервера OKX
app.get('/api/public/time', async (req, res) => {
  try {
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Обращаемся к API для получения времени сервера
    const response = await client.get('/api/v5/public/time');
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении времени сервера:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для отправки ордера
app.post('/api/trade/order', async (req, res) => {
  try {
    // Получаем данные из тела запроса
    const orderData = req.body;
    
    // Проверка обязательных полей
    if (!orderData.instId || !orderData.tdMode || !orderData.side || !orderData.ordType) {
      return res.status(400).json({
        message: 'Обязательные поля: instId, tdMode, side, ordType'
      });
    }
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Выполняем запрос к API
    const response = await client.postPrivate('/api/v5/trade/order', orderData);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при отправке ордера:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения статуса системы
app.get('/api/system/status', async (req, res) => {
  try {
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Выполняем запрос к API
    const response = await client.get('/api/v5/system/status');
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении статуса системы:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения списка активных ордеров (требует аутентификации)
app.get('/api/trading/orders', async (req, res) => {
  try {
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Получаем список активных ордеров
    const response = await client.getPrivate('/api/v5/trade/orders-pending', {
      instType: 'SPOT', // Тип инструмента (SPOT, MARGIN, SWAP, FUTURES, OPTION)
      state: 'live'    // Статус ордера (live, partially_filled)
    });
    
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении ордеров:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения книги ордеров
app.get('/api/market/books', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instId, sz } = req.query;
    
    // Проверка обязательных параметров
    if (!instId) {
      return res.status(400).json({ message: 'Параметр instId обязателен' });
    }
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = { instId };
    if (sz) params.sz = sz;
    
    // Выполняем запрос к API
    const response = await client.get('/api/v5/market/books', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении книги ордеров:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения свечей графика
app.get('/api/market/candles', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instId, bar, before, after, limit } = req.query;
    
    // Проверка обязательных параметров
    if (!instId) {
      return res.status(400).json({ message: 'Параметр instId обязателен' });
    }
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = { instId };
    if (bar) params.bar = bar;
    if (before) params.before = before;
    if (after) params.after = after;
    if (limit) params.limit = limit;
    
    // Выполняем запрос к API
    const response = await client.get('/api/v5/market/candles', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении свечей графика:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения списка активных ордеров
app.get('/api/trade/orders-pending', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instType, instId, ordType, state, before, after, limit } = req.query;
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = {};
    if (instType) params.instType = instType;
    if (instId) params.instId = instId;
    if (ordType) params.ordType = ordType;
    if (state) params.state = state;
    if (before) params.before = before;
    if (after) params.after = after;
    if (limit) params.limit = limit;
    
    // Выполняем запрос к API
    const response = await client.getPrivate('/api/v5/trade/orders-pending', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении активных ордеров:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для получения истории ордеров
app.get('/api/trade/orders-history', async (req, res) => {
  try {
    // Получаем параметры из запроса
    const { instType, instId, ordType, state, before, after, limit } = req.query;
    
    // Проверка обязательных параметров
    if (!instType) {
      return res.status(400).json({ message: 'Параметр instType обязателен' });
    }
    
    // Создаем клиент OKX API
    const client = new okx.RestClient({
      apiKey: process.env.API_KEY,
      apiSecret: process.env.API_SECRET,
      apiPass: process.env.API_PASSPHRASE
    });
    
    // Формируем параметры запроса
    const params = { instType };
    if (instId) params.instId = instId;
    if (ordType) params.ordType = ordType;
    if (state) params.state = state;
    if (before) params.before = before;
    if (after) params.after = after;
    if (limit) params.limit = limit;
    
    // Выполняем запрос к API
    const response = await client.getPrivate('/api/v5/trade/orders-history', params);
    
    // Отправляем результат клиенту
    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении истории ордеров:', error);
    res.status(500).json({ error: error.message });
  }
});

// API 404 handler - handle all undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Catch-all route for non-API requests - redirect to Next.js
app.use((req, res) => {
  // Only redirect if it's not an API request
  if (!req.path.startsWith('/api/')) {
    return res.redirect(`http://localhost:3000${req.originalUrl}`);
  }
  // If somehow an API route gets here, return 404
  res.status(404).send('Not Found');
});

// Create WebSocket server for proxy with path /ws/okx
const wss = new WebSocket.Server({ 
  noServer: true, // We'll handle the upgrade manually
  path: '/ws/okx', // Only handle WebSocket connections at /ws/okx
  clientTracking: true, // Track connected clients
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024 // Size threshold in bytes for compression
  }
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  
  try {
    // Only allow WebSocket connections to /ws/okx
    if (pathname === '/ws/okx') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Close the connection if path is not /ws/okx
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
    }
  } catch (err) {
    console.error('WebSocket upgrade error:', err);
    socket.destroy();
  }
});

// Управление WebSocket подключениями
const clients = new Map();

// Создаем центральное соединение с OKX
const okxWsConnections = new Map(); // Ключ - инструмент, значение - активные клиенты и websocket

// Функция для создания или повторного использования OKX WebSocket соединения
function getOrCreateOkxConnection(instId, clientId, clientWs) {
  // Проверяем, есть ли уже соединение для этого инструмента
  if (!okxWsConnections.has(instId)) {
    console.log(`Создание нового OKX WebSocket соединения для ${instId}`);
    
    // Создаем новое соединение
    try {
      const okxWs = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
      
      // Создаем структуру данных для этого соединения
      const connection = {
        ws: okxWs,
        clients: new Set(), // Список клиентов, подписанных на этот инструмент
        isConnected: false,
        subscribed: false
      };
      
      // Добавляем клиента в список
      connection.clients.add(clientId);
      
      // Обработчик открытия соединения
      okxWs.on('open', () => {
        console.log(`OKX WebSocket соединение установлено для ${instId}`);
        connection.isConnected = true;
        
        // Отправляем уведомление всем клиентам
        for (const cId of connection.clients) {
          const client = clients.get(cId);
          if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ event: 'connected', instId: instId }));
          }
        }
        
        // Подписываемся на тикеры для данного инструмента
        const subscribeMessage = {
          op: 'subscribe',
          args: [{
            channel: 'tickers',
            instId: instId
          }]
        };
        
        okxWs.send(JSON.stringify(subscribeMessage));
        connection.subscribed = true;
      });
      
      // Обработчик сообщений
      okxWs.on('message', (data) => {
        try {
          const jsonData = JSON.parse(data.toString());
          
          // Логируем получение данных тикера
          if (jsonData.data && jsonData.arg?.channel === 'tickers') {
            console.log(`Получены данные тикера для ${jsonData.arg.instId}: ${jsonData.data[0].last} USDT`);
          }
          
          // Передаем данные всем подписанным клиентам
          for (const cId of connection.clients) {
            const client = clients.get(cId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(data);
            }
          }
        } catch (error) {
          console.error('Ошибка при обработке сообщения от OKX:', error);
          
          // Пробуем отправить сырые данные
          for (const cId of connection.clients) {
            const client = clients.get(cId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(data);
            }
          }
        }
      });
      
      // Обработчик ошибок
      okxWs.on('error', (error) => {
        console.error(`Ошибка OKX WebSocket для ${instId}:`, error);
        
        // Отправляем уведомление об ошибке всем клиентам
        for (const cId of connection.clients) {
          const client = clients.get(cId);
          if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ error: `Ошибка OKX WebSocket: ${error.message || 'Неизвестная ошибка'}` }));
          }
        }
      });
      
      // Обработчик закрытия соединения
      okxWs.on('close', (code, reason) => {
        console.log(`OKX WebSocket соединение закрыто для ${instId}: код ${code}, причина: ${reason}`);
        connection.isConnected = false;
        connection.subscribed = false;
        
        // Отправляем уведомление о закрытии всем клиентам
        for (const cId of connection.clients) {
          const client = clients.get(cId);
          if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({ event: 'disconnected', instId: instId }));
          }
        }
        
        // Пробуем переподключиться через 3 секунды, если есть активные клиенты
        if (connection.clients.size > 0) {
          setTimeout(() => {
            // Проверяем, есть ли еще активные клиенты
            if (connection.clients.size > 0) {
              console.log(`Попытка переподключения OKX WebSocket для ${instId}`);
              
              // Создаем новое соединение
              const newOkxWs = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
              connection.ws = newOkxWs;
              
              // Настраиваем те же обработчики событий
              // Здесь должен быть код настройки новых обработчиков...
            } else {
              // Если нет активных клиентов, удаляем соединение из кэша
              okxWsConnections.delete(instId);
            }
          }, 3000);
        } else {
          // Если нет активных клиентов, удаляем соединение из кэша
          okxWsConnections.delete(instId);
        }
      });
      
      // Сохраняем соединение в кэше
      okxWsConnections.set(instId, connection);
      
      return connection;
    } catch (error) {
      console.error(`Ошибка при создании OKX WebSocket для ${instId}:`, error);
      
      // Отправляем ошибку клиенту
      if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: `Ошибка при создании OKX WebSocket: ${error.message || 'Неизвестная ошибка'}` }));
      }
      
      return null;
    }
  } else {
    // Используем существующее соединение
    const connection = okxWsConnections.get(instId);
    
    // Добавляем клиента в список
    connection.clients.add(clientId);
    
    // Если соединение уже установлено, отправляем уведомление клиенту
    if (connection.isConnected && clientWs && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ event: 'connected', instId: instId }));
    }
    
    return connection;
  }
}

// Обработка подключений клиентов
wss.on('connection', (ws, req) => {
  // Проверяем URL соединения
  if (!req.url || !req.url.startsWith('/ws/okx')) {
    console.log('WebSocket connection rejected - invalid path:', req.url);
    ws.close(1008, 'Invalid WebSocket path');
    return;
  }
  console.log('Новое WebSocket подключение');
  
  // Получаем параметры из запроса
  const url = new URL(req.url, `http://${req.headers.host}`);
  const instId = url.searchParams.get('instId') || 'BTC-USDT';
  
  // Создаем уникальный ID для клиента
  const clientId = Date.now();
  
  // Сохраняем информацию о клиенте
  clients.set(clientId, {
    ws, 
    instId
  });
  
  // Отправляем приветственное сообщение
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event: 'welcome', message: 'Добро пожаловать в OKX API WebSocket прокси' }));
  }
  
  // Получаем или создаем соединение с OKX
  const connection = getOrCreateOkxConnection(instId, clientId, ws);
  
  // Если не удалось создать соединение
  if (!connection) {
    console.error(`Не удалось создать соединение для ${instId}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ error: 'Не удалось создать соединение с OKX API' }));
    }
  }
  
  // Обрабатываем сообщения от клиента
  ws.on('message', (message) => {
    try {
      // Парсим сообщение от клиента
      const clientMessage = JSON.parse(message.toString());
      console.log('Получено сообщение от клиента:', clientMessage);
      
      // Если это ping, отвечаем pong
      if (clientMessage.op === 'ping') {
        ws.send(JSON.stringify({ event: 'pong', ts: Date.now() }));
        return;
      }
      
      // Если клиент хочет изменить инструмент
      if (clientMessage.op === 'changeInstrument' && clientMessage.instId) {
        const newInstId = clientMessage.instId;
        const client = clients.get(clientId);
        
        if (client) {
          // Удаляем клиента из текущего подключения
          if (okxWsConnections.has(client?.instId)) {
            const oldConnection = okxWsConnections.get(client.instId);
            oldConnection?.clients.delete(clientId);
          }
          
          // Обновляем инструмент клиента
          client.instId = newInstId;
          
          // Получаем или создаем новое соединение
          getOrCreateOkxConnection(newInstId, clientId, ws);
          
          ws.send(JSON.stringify({ event: 'instrumentChanged', instId: newInstId }));
        }
        return;
      }
      
      // Если клиент отправил команду на подписку
      const client = clients.get(clientId);
      if (client && client.instId && okxWsConnections.has(client.instId)) {
        const connection = okxWsConnections.get(client.instId);
        
        if (connection?.ws?.readyState === WebSocket.OPEN) {
          // Передаем в OKX WebSocket
          connection.ws.send(message);
        } else {
          ws.send(JSON.stringify({ error: `Нет активного соединения с OKX для инструмента ${client.instId}` }));
        }
      } else {
        ws.send(JSON.stringify({ error: 'Не найдено активное соединение для клиента' }));
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения от клиента:', error);
      ws.send(JSON.stringify({ error: `Ошибка при обработке запроса: ${error.message}` }));
    }
  });
  
  // Обрабатываем закрытие соединения клиента
  ws.on('close', (code, reason) => {
    console.log(`Клиент отключился с кодом ${code}, причина: ${reason}`);
    
    // Получаем информацию о клиенте
    const client = clients.get(clientId);
    if (client && client.instId && okxWsConnections.has(client.instId)) {
      // Удаляем клиента из списка подписчиков
      const connection = okxWsConnections.get(client.instId);
      if (connection) {
        connection?.clients.delete(clientId);
        
        // Если нет активных клиентов, закрываем соединение
        if (connection.clients.size === 0) {
          console.log(`Закрытие OKX WebSocket для ${client.instId} - нет активных клиентов`);
          if (connection.ws?.readyState === WebSocket.OPEN) {
            connection.ws.close();
          }
          // Удаляем из кэша
          okxWsConnections.delete(client.instId);
        }
      }
    }
    
    // Удаляем клиента из списка
    clients.delete(clientId);
  });
  
  // Обработка ошибок клиентского WebSocket
  ws.on('error', (error) => {
    console.error('Ошибка клиентского WebSocket:', error);
  });
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      console.error('Server error:', error);
      throw error;
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception: %O', error);
  // Log the full error stack using proper debug formatting
  debug('Uncaught Exception Stack: %s', error.stack);
  // Attempt to log the error to a file or monitoring service
  process.exit(1); // Exit with failure
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at: %O, reason: %O', promise, reason);
  // Consider logging to an error tracking service here
});

// Handle process signals
process.on('SIGTERM', () => {
  debug('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    debug('Server closed');
    process.exit(0);
  });
});

// Start the server
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
});

// Start listening
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws/okx`);
  console.log(`API documentation available at http://localhost:${PORT}/api/status`);
  console.log('Client interface available at http://localhost:3000');
  
  // Log environment info for debugging
  debug('Environment:');
  debug('NODE_ENV: %s', process.env.NODE_ENV);
  debug('PORT: %s', PORT);
  debug('OKX API Key: %s', process.env.API_KEY ? `***${process.env.API_KEY.slice(-4)}` : 'Not set');
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = `Port ${PORT}`; // Always use 'Port' as we're normalizing the type

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
