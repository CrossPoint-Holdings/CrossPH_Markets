import { useEffect, useMemo, useRef, useState } from "react";
import { generateHistory, timeframeSeconds } from "./generateHistory";
import type { Candle, Instrument, Quote, Timeframe } from "./types";

export type FeedStatus = "loading" | "market" | "demo" | "paused";

interface MarketResponse {
  source: "twelve-data";
  symbol: string;
  timeframe: Timeframe;
  updatedAt: number;
  candles: Candle[];
}

export function useMarketFeed(instrument: Instrument, timeframe: Timeframe, live: boolean) {
  const initial = useMemo(() => generateHistory(instrument, timeframe), [instrument, timeframe]);
  const [candles, setCandles] = useState<Candle[]>(initial);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>(live ? "loading" : "paused");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [feedMessage, setFeedMessage] = useState<string | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    setCandles(initial);
    setFeedStatus(live ? "loading" : "paused");
    setLastUpdated(null);
    setFeedMessage(null);
    tickRef.current = 0;
  }, [initial, live]);

  useEffect(() => {
    if (!live) return;
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(
          `/api/market?symbol=${encodeURIComponent(instrument.symbol)}&timeframe=${encodeURIComponent(timeframe)}&outputsize=260`,
          { headers: { Accept: "application/json" } },
        );
        const contentType = response.headers.get("content-type") ?? "";
        if (!response.ok || !contentType.includes("application/json")) throw new Error("Live endpoint unavailable.");
        const payload = (await response.json()) as MarketResponse;
        if (!payload.candles?.length) throw new Error("Live endpoint returned no candles.");
        if (!active) return;
        setCandles(payload.candles);
        setFeedStatus("market");
        setLastUpdated(payload.updatedAt);
        setFeedMessage(null);
      } catch {
        if (!active) return;
        setFeedStatus("demo");
        setFeedMessage("Live provider unavailable. Showing simulated fallback.");
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [instrument.symbol, live, timeframe]);

  useEffect(() => {
    if (!live || feedStatus === "market") return;
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
  }, [feedStatus, instrument, timeframe, live]);

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

  return { candles, quote, feedStatus, lastUpdated, feedMessage };
}
