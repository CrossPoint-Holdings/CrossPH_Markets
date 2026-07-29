import { useEffect, useMemo, useRef, useState } from "react";
import { generateHistory, timeframeSeconds } from "./generateHistory";
import type { Candle, Instrument, Quote, Timeframe } from "./types";

export function useMarketFeed(instrument: Instrument, timeframe: Timeframe, live: boolean) {
  const initial = useMemo(() => generateHistory(instrument, timeframe), [instrument, timeframe]);
  const [candles, setCandles] = useState<Candle[]>(initial);
  const tickRef = useRef(0);

  useEffect(() => {
    setCandles(initial);
    tickRef.current = 0;
  }, [initial]);

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      setCandles((current) => {
        if (!current.length) return current;
        const next = [...current];
        const last = { ...next[next.length - 1] };
        tickRef.current += 1;
        const wave = Math.sin(tickRef.current / 2.4) * instrument.volatility * 0.22;
        const noise = (Math.random() - 0.5) * instrument.volatility * 0.38;
        const nextClose = Math.max(0.0001, last.close * (1 + wave + noise));
        const shouldAddBar = tickRef.current % 6 === 0;
        if (shouldAddBar) {
          const time = last.time + timeframeSeconds(timeframe);
          next.push({
            time,
            open: last.close,
            high: Math.max(last.close, nextClose),
            low: Math.min(last.close, nextClose),
            close: nextClose,
            volume: Math.round(130000 + Math.random() * 1700000),
          });
          if (next.length > 300) next.shift();
        } else {
          last.close = nextClose;
          last.high = Math.max(last.high, nextClose);
          last.low = Math.min(last.low, nextClose);
          last.volume += Math.round(1200 + Math.random() * 18000);
          next[next.length - 1] = last;
        }
        return next;
      });
    }, 1250);
    return () => window.clearInterval(timer);
  }, [instrument, timeframe, live]);

  const quote = useMemo<Quote>(() => {
    const first = candles[0]?.open ?? instrument.basePrice;
    const last = candles.at(-1)?.close ?? instrument.basePrice;
    const change = last - first;
    const spread = Math.max(last * 0.00018, 10 ** -instrument.precision);
    return {
      symbol: instrument.symbol,
      price: last,
      change,
      changePercent: (change / first) * 100,
      bid: last - spread,
      ask: last + spread,
      volume: candles.reduce((sum, candle) => sum + candle.volume, 0),
    };
  }, [candles, instrument]);

  return { candles, quote };
}
