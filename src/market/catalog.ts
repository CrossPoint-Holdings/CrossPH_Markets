import type { Instrument } from "./types";

export const instruments: Instrument[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", assetClass: "Stock", basePrice: 227.73, volatility: 0.013, precision: 2, sector: "Semiconductors" },
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", assetClass: "Stock", basePrice: 213.88, volatility: 0.008, precision: 2, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", assetClass: "Stock", basePrice: 489.62, volatility: 0.007, precision: 2, sector: "Software" },
  { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", assetClass: "Stock", basePrice: 329.14, volatility: 0.018, precision: 2, sector: "Automotive" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", assetClass: "Stock", basePrice: 227.51, volatility: 0.009, precision: 2, sector: "Retail" },
  { symbol: "META", name: "Meta Platforms", exchange: "NASDAQ", assetClass: "Stock", basePrice: 719.01, volatility: 0.011, precision: 2, sector: "Technology" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", exchange: "NYSE Arca", assetClass: "ETF", basePrice: 635.34, volatility: 0.005, precision: 2, sector: "Broad Market" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "NASDAQ", assetClass: "ETF", basePrice: 568.77, volatility: 0.006, precision: 2, sector: "Broad Market" },
  { symbol: "BTCUSD", name: "Bitcoin / U.S. Dollar", exchange: "CRYPTO", assetClass: "Crypto", basePrice: 118420, volatility: 0.015, precision: 0, sector: "Digital Assets" },
  { symbol: "EURUSD", name: "Euro / U.S. Dollar", exchange: "FX", assetClass: "Forex", basePrice: 1.1542, volatility: 0.002, precision: 4, sector: "Currencies" },
];

export const instrumentBySymbol = (symbol: string) =>
  instruments.find((instrument) => instrument.symbol === symbol) ?? instruments[0];
