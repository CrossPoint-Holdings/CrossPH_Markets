import { describe, expect, it } from "vitest";
import { ema, sma, vwap } from "./indicators";
import type { Candle } from "./types";

const candles: Candle[] = [10, 11, 12, 13].map((close, index) => ({
  time: index + 1,
  open: close,
  high: close + 1,
  low: close - 1,
  close,
  volume: 100,
}));

describe("market indicators", () => {
  it("calculates a simple moving average", () => {
    expect(sma(candles, 3).map((point) => point.value)).toEqual([11, 12]);
  });

  it("keeps EMA aligned with input timestamps", () => {
    const result = ema(candles, 3);
    expect(result).toHaveLength(4);
    expect(result.at(-1)?.time).toBe(4);
  });

  it("calculates cumulative VWAP", () => {
    expect(vwap(candles)[0].value).toBe(10);
    expect(vwap(candles).at(-1)?.value).toBe(11.5);
  });
});
