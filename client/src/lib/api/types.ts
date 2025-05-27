/**
 * Общие типы для работы с OKX API
 */

// Базовый интерфейс для всех ответов API
export interface APIResponse<T> {
  code: string;
  msg?: string;
  data?: T;
}

// Типы параметров для различных эндпоинтов
export interface MarketTickersParams {
  instType: string;
  uly?: string;
}

export interface MarketTickerParams {
  instId: string;
}

export interface MarketBooksParams {
  instId: string;
  sz?: string;
}

export interface MarketCandlesParams {
  instId: string;
  bar?: string;
  after?: string;
  before?: string;
  limit?: string;
}

export interface PublicInstrumentsParams {
  instType: string;
  uly?: string;
  instId?: string;
}

export interface OrderParams {
  instId: string;
  tdMode: string;
  side: string;
  ordType: string;
  sz: string;
  px?: string;
  clOrdId?: string;
}

export interface OrderListParams {
  instType?: string;
  uly?: string;
  instId?: string;
  ordType?: string;
  state?: string;
  after?: string;
  before?: string;
  limit?: string;
}

export interface BalanceParams {
  ccy?: string;
}

export interface PositionsParams {
  instType?: string;
  instId?: string;
  posId?: string;
}
