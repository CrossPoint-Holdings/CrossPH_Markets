import type { Candle } from "./types";

export interface IndicatorPoint {
  time: number;
  value: number;
}

export function sma(candles: Candle[], period: number): IndicatorPoint[] {
  if (period <= 0) return [];
  let sum = 0;
  const values: IndicatorPoint[] = [];
  candles.forEach((candle, index) => {
    sum += candle.close;
    if (index >= period) sum -= candles[index - period].close;
    if (index >= period - 1) values.push({ time: candle.time, value: sum / period });
  });
  return values;
}

export function ema(candles: Candle[], period: number): IndicatorPoint[] {
  if (!candles.length || period <= 0) return [];
  const multiplier = 2 / (period + 1);
  let current = candles[0].close;
  return candles.map((candle, index) => {
    current = index === 0 ? candle.close : (candle.close - current) * multiplier + current;
    return { time: candle.time, value: current };
  });
}

export function vwap(candles: Candle[]): IndicatorPoint[] {
  let cumulativePriceVolume = 0;
  let cumulativeVolume = 0;
  return candles.map((candle) => {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativePriceVolume += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
    return { time: candle.time, value: cumulativePriceVolume / Math.max(1, cumulativeVolume) };
  });
}
