export type Timeframe = "1m" | "5m" | "15m" | "1h" | "1D";
export type ChartMode = "candles" | "line" | "area";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Instrument {
  symbol: string;
  name: string;
  exchange: string;
  assetClass: "Stock" | "ETF" | "Crypto" | "Forex";
  basePrice: number;
  volatility: number;
  precision: number;
  sector: string;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  volume: number;
}

export interface IndicatorSettings {
  sma: boolean;
  ema: boolean;
  vwap: boolean;
  volume: boolean;
}
