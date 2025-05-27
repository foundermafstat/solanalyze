/**
 * API клиент для работы с OKX API через наш сервер
 */
import { APIResponse } from './types';

// Базовый URL нашего сервера
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Функция для выполнения HTTP запросов
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  return data as APIResponse<T>;
}

// API клиент с методами для каждого эндпоинта
const apiClient = {
  // Системные эндпоинты
  getStatus: () => fetchAPI('/api/status'),
  
  // Аккаунт
  getAccountInstruments: (params?: any) => 
    fetchAPI('/api/account/instruments', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getBalance: (params?: any) => 
    fetchAPI('/api/account/balance', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getPositions: (params?: any) => 
    fetchAPI('/api/account/positions', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getPositionsHistory: (params?: any) => 
    fetchAPI('/api/account/positions-history', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getAccountPositionRisk: (params?: any) => 
    fetchAPI('/api/account/position-risk', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getBills: (params?: any) => 
    fetchAPI('/api/account/bills', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getBillsArchive: (params?: any) => 
    fetchAPI('/api/account/bills-archive', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getAccountConfiguration: (params?: any) => 
    fetchAPI('/api/account/config', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  // Торговля
  submitOrder: (params: any) => 
    fetchAPI('/api/trade/order', { method: 'POST', body: JSON.stringify(params) }),
  
  submitMultipleOrders: (params: any) => 
    fetchAPI('/api/trade/batch-orders', { method: 'POST', body: JSON.stringify(params) }),
  
  cancelOrder: (params: any) => 
    fetchAPI('/api/trade/cancel-order', { method: 'POST', body: JSON.stringify(params) }),
  
  cancelMultipleOrders: (params: any) => 
    fetchAPI('/api/trade/cancel-batch-orders', { method: 'POST', body: JSON.stringify(params) }),
  
  amendOrder: (params: any) => 
    fetchAPI('/api/trade/amend-order', { method: 'POST', body: JSON.stringify(params) }),
  
  getOrderDetails: (params: any) => 
    fetchAPI('/api/trade/order', { method: 'GET', body: JSON.stringify(params) }),
  
  getOrderList: (params?: any) => 
    fetchAPI('/api/trade/orders-pending', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getOrderHistory: (params?: any) => 
    fetchAPI('/api/trade/orders-history', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  // Маркетинговые данные
  getMarketTickers: (params?: any) => 
    fetchAPI('/api/market/tickers', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getMarketTicker: (params: any) => 
    fetchAPI('/api/market/ticker', { method: 'GET', body: JSON.stringify(params) }),
  
  getMarketIndexTickers: (params?: any) => 
    fetchAPI('/api/market/index-tickers', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getMarketBooks: (params: any) => 
    fetchAPI('/api/market/books', { method: 'GET', body: JSON.stringify(params) }),
  
  getMarketCandles: (params: any) => 
    fetchAPI('/api/market/candles', { method: 'GET', body: JSON.stringify(params) }),
  
  getMarketHistoryCandles: (params: any) => 
    fetchAPI('/api/market/history-candles', { method: 'GET', body: JSON.stringify(params) }),
  
  getMarketIndexCandles: (params: any) => 
    fetchAPI('/api/market/index-candles', { method: 'GET', body: JSON.stringify(params) }),
  
  getMarketMarkPriceCandles: (params: any) => 
    fetchAPI('/api/market/mark-price-candles', { method: 'GET', body: JSON.stringify(params) }),
  
  // Публичные данные
  getPublicInstruments: (params: any) => 
    fetchAPI('/api/public/instruments', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicDeliveryExerciseHistory: (params: any) => 
    fetchAPI('/api/public/delivery-exercise-history', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicOpenInterest: (params: any) => 
    fetchAPI('/api/public/open-interest', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicFundingRate: (params: any) => 
    fetchAPI('/api/public/funding-rate', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicFundingRateHistory: (params: any) => 
    fetchAPI('/api/public/funding-rate-history', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicPriceLimit: (params: any) => 
    fetchAPI('/api/public/price-limit', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicOptionSummary: (params: any) => 
    fetchAPI('/api/public/opt-summary', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicEstimatedPrice: (params: any) => 
    fetchAPI('/api/public/estimated-price', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicDiscountInfo: (params?: any) => 
    fetchAPI('/api/public/discount-rate-interest-free-quota', { method: 'GET', body: params ? JSON.stringify(params) : undefined }),
  
  getPublicTime: () => 
    fetchAPI('/api/public/time', { method: 'GET' }),
  
  getPublicLiquidationOrders: (params: any) => 
    fetchAPI('/api/public/liquidation-orders', { method: 'GET', body: JSON.stringify(params) }),
  
  getPublicMarkPrice: (params: any) => 
    fetchAPI('/api/public/mark-price', { method: 'GET', body: JSON.stringify(params) }),
  
  getSystemStatus: () => 
    fetchAPI('/api/system/status', { method: 'GET' }),
};

export default apiClient;
