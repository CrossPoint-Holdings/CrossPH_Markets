import type { VercelRequest, VercelResponse } from "@vercel/node";

const allowedSymbols = new Set(["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "META", "SPY", "QQQ", "BTCUSD", "EURUSD"]);
const providerSymbols: Record<string, string> = {
  BTCUSD: "BTC/USD",
  EURUSD: "EUR/USD",
};
const intervals: Record<string, string> = {
  "1m": "1min",
  "5m": "5min",
  "15m": "15min",
  "1h": "1h",
  "1D": "1day",
};

interface ProviderBar {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string | null;
}

interface ProviderResponse {
  status?: string;
  message?: string;
  values?: ProviderBar[];
}

const toTimestamp = (datetime: string) => {
  const normalized = datetime.includes("T") ? datetime : datetime.replace(" ", "T");
  const timestamp = Date.parse(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
  return Math.floor(timestamp / 1000);
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed." });
  }

  const symbol = String(request.query.symbol ?? "NVDA").toUpperCase();
  const timeframe = String(request.query.timeframe ?? "5m");
  const requestedOutputSize = Number(request.query.outputsize ?? 260);
  const outputsize = Number.isFinite(requestedOutputSize)
    ? Math.min(300, Math.max(80, requestedOutputSize))
    : 260;
  if (!allowedSymbols.has(symbol) || !intervals[timeframe]) {
    return response.status(400).json({ error: "Unsupported market symbol or timeframe." });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Live market data is not configured." });
  }

  const params = new URLSearchParams({
    symbol: providerSymbols[symbol] ?? symbol,
    interval: intervals[timeframe],
    outputsize: String(outputsize),
    timezone: "UTC",
    order: "ASC",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const providerResponse = await fetch(`https://api.twelvedata.com/time_series?${params}`, {
      headers: { Authorization: `apikey ${apiKey}` },
      signal: controller.signal,
    });
    const payload = (await providerResponse.json()) as ProviderResponse;
    if (!providerResponse.ok || payload.status === "error" || !payload.values?.length) {
      const status = providerResponse.status === 429 ? 429 : 502;
      return response.status(status).json({ error: payload.message ?? "Market-data provider returned no values." });
    }

    const candles = payload.values
      .map((bar) => ({
        time: toTimestamp(bar.datetime),
        open: Number(bar.open),
        high: Number(bar.high),
        low: Number(bar.low),
        close: Number(bar.close),
        volume: Number(bar.volume ?? 0),
      }))
      .filter((bar) => Number.isFinite(bar.time) && Number.isFinite(bar.close));

    response.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
    return response.status(200).json({
      source: "twelve-data",
      symbol,
      timeframe,
      updatedAt: Date.now(),
      candles,
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Market-data provider timed out."
      : "Unable to reach the market-data provider.";
    return response.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
