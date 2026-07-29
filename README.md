# Crosspoint Markets Terminal

An original React and TypeScript market-analysis terminal for Crosspoint Markets. It uses simulated data and paper orders so the complete interface can run locally without a backend.

## Included in this release

- Responsive candlestick, line, and area charts
- Simulated live OHLCV updates for stocks, ETFs, crypto, and forex
- Wheel/pinch zoom, drag pan, crosshair, fit view, grid, and fullscreen controls
- SMA, EMA, VWAP, and volume toggles
- Collapsible drawing rail with pan, cursor, trend line, horizontal line, box, Fibonacci retracement, ruler, arrow, text, support/resistance zones, double top, and head-and-shoulders tools
- Drawing selection, movement, deletion, clearing, and per-symbol browser persistence
- Watchlist, market screener, local price alerts, and sample news
- Paper market/limit orders, positions, open orders, history, and local account persistence
- Desktop, tablet, and chart-first mobile layouts
- Automated indicator, drawing-geometry, paper-engine, and browser smoke tests

## Run locally

Requirements: Node.js 24 or another version supported by Vite 8.

```powershell
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Enable market data on Vercel

The terminal uses a Vercel Function at `/api/market` to keep the provider credential out of browser code. Without a configured credential, it automatically shows the clearly labeled simulated fallback.

1. Create a Twelve Data account and copy an API key.
2. Open the CrossPH Markets project in Vercel.
3. Go to **Settings → Environment Variables**.
4. Add `TWELVE_DATA_API_KEY` for Production and Preview. Do not add a `VITE_` prefix.
5. Redeploy the latest `main` deployment.

The live adapter loads provider OHLCV history and refreshes the active chart every minute. Twelve Data limits and display/redistribution rights depend on the selected plan. Confirm that the plan permits public external display before using the feed for public users.

For local Function testing, copy `.env.example` to `.env.local`, add the private value, and use Vercel’s local development command. Never commit `.env.local`.

Production verification:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus symbol selector |
| `D` | Expand/collapse drawing tools |
| `V` | Pan/zoom mode |
| `T` | Trend-line tool |
| `B` | Box tool |
| `R` | Fit chart content |
| `Delete` / `Backspace` | Delete selected drawing |
| `Escape` | Cancel drawing and return to pan mode |

Hold Shift when completing a drawing to keep the same drawing tool active.

## Project structure

```text
src/
  chart/       Financial chart integration
  drawings/    SVG tools, geometry, and interactions
  market/      Instruments, simulated data, and indicators
  paper/       Paper-order engine and ticket
  shared/      Formatting and browser persistence
  workspace/   Terminal navigation, panels, and tables
```

The market-data hook and paper engine are isolated from the interface. A later backend can replace the simulator with WebSocket history/quote adapters and replace paper execution with an authenticated brokerage service without rebuilding the terminal layout.

## Important limitations

- When the provider is configured, chart OHLCV values come from Twelve Data; otherwise values are demonstration data.
- The application does not place real trades or provide financial advice.
- Browser storage is local to one device and is not an account database.
- Production market data and brokerage features require licensed providers, authentication, server-side validation, audit logging, security review, and applicable regulatory/legal work.

## Open-source charting

Financial rendering uses [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts), version 5.2.0, under the Apache License 2.0. The required product attribution is visible in the terminal footer and chart. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

This project does not contain TradingView’s proprietary Advanced Charts/Charting Library source and does not copy TradingView website code, text, branding, or protected visual assets.
