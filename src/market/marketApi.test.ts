import { afterEach, describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "../../api/market";

function responseDouble() {
  let statusCode = 200;
  let body: unknown;
  const headers = new Map<string, string>();
  const response = {
    setHeader: (name: string, value: string) => {
      headers.set(name, value);
      return response;
    },
    status: (code: number) => {
      statusCode = code;
      return response;
    },
    json: (value: unknown) => {
      body = value;
      return response;
    },
  } as unknown as VercelResponse;
  return { response, result: () => ({ statusCode, body, headers }) };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("market Vercel function", () => {
  it("returns a clear configuration error without a provider key", async () => {
    vi.stubEnv("TWELVE_DATA_API_KEY", "");
    const { response, result } = responseDouble();
    await handler({ method: "GET", query: { symbol: "AAPL", timeframe: "5m" } } as unknown as VercelRequest, response);
    expect(result().statusCode).toBe(503);
  });

  it("normalizes provider OHLCV values", async () => {
    vi.stubEnv("TWELVE_DATA_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "ok",
            values: [
              { datetime: "2026-07-29 13:30:00", open: "200", high: "203", low: "199", close: "202", volume: "1200" },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    const { response, result } = responseDouble();
    await handler({ method: "GET", query: { symbol: "AAPL", timeframe: "5m" } } as unknown as VercelRequest, response);
    expect(result().statusCode).toBe(200);
    expect(result().body).toMatchObject({
      source: "twelve-data",
      symbol: "AAPL",
      candles: [{ open: 200, high: 203, low: 199, close: 202, volume: 1200 }],
    });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("interval=5min"), expect.any(Object));
  });
});
