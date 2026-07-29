import type { Candle, Instrument, Timeframe } from "./types";

const intervalSeconds: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "1D": 86400,
};

const hash = (text: string) =>
  [...text].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 2166136261);

const seededRandom = (seed: number) => {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

export function generateHistory(instrument: Instrument, timeframe: Timeframe, count = 260): Candle[] {
  const random = seededRandom(hash(`${instrument.symbol}-${timeframe}`));
  const step = intervalSeconds[timeframe];
  const now = Math.floor(Date.now() / 1000 / step) * step;
  let previousClose = instrument.basePrice * (0.92 + random() * 0.08);

  return Array.from({ length: count }, (_, index) => {
    const drift = (random() - 0.46) * instrument.volatility;
    const open = previousClose;
    const close = Math.max(0.0001, open * (1 + drift));
    const spread = open * instrument.volatility * (0.24 + random() * 0.7);
    const high = Math.max(open, close) + spread;
    const low = Math.max(0.0001, Math.min(open, close) - spread * (0.65 + random() * 0.45));
    const volume = Math.round(180000 + random() * 2200000);
    previousClose = close;
    return {
      time: now - (count - index) * step,
      open,
      high,
      low,
      close,
      volume,
    };
  });
}

export const timeframeSeconds = (timeframe: Timeframe) => intervalSeconds[timeframe];
