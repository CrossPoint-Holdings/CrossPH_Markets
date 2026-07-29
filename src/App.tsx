import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid3X3, RotateCcw, Star, StarOff, Wrench } from "lucide-react";
import { MarketChart } from "./chart/MarketChart";
import type { Drawing, DrawingTool } from "./drawings/types";
import { instrumentBySymbol, instruments } from "./market/catalog";
import type { ChartMode, IndicatorSettings, Timeframe } from "./market/types";
import { useMarketFeed } from "./market/useMarketFeed";
import { usePaperTrading } from "./paper/usePaperTrading";
import { formatCompact, formatPrice, formatSignedPercent } from "./shared/format";
import { loadLocal, saveLocal } from "./shared/storage";
import { BottomDock } from "./workspace/BottomDock";
import { DrawingRail } from "./workspace/DrawingRail";
import { SideWorkspace, type PriceAlert } from "./workspace/SideWorkspace";
import { TopBar } from "./workspace/TopBar";

interface Toast {
  id: string;
  message: string;
  tone: "positive" | "negative" | "neutral";
}

const initialIndicators: IndicatorSettings = { sma: true, ema: false, vwap: true, volume: true };

export default function App() {
  const [symbol, setSymbol] = useState("NVDA");
  const [timeframe, setTimeframe] = useState<Timeframe>("5m");
  const [mode, setMode] = useState<ChartMode>("candles");
  const [indicators, setIndicators] = useState(initialIndicators);
  const [live, setLive] = useState(true);
  const [grid, setGrid] = useState(true);
  const [tool, setTool] = useState<DrawingTool>("pan");
  const [railExpanded, setRailExpanded] = useState(false);
  const [sideOpen, setSideOpen] = useState(() => window.innerWidth > 980);
  const [resetToken, setResetToken] = useState(0);
  const [drawingsBySymbol, setDrawingsBySymbol] = useState<Record<string, Drawing[]>>(() =>
    loadLocal("crossph-markets:drawings:v1", {}),
  );
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadLocal("crossph-markets:alerts:v1", []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [favorite, setFavorite] = useState(true);
  const workspaceRef = useRef<HTMLElement>(null);
  const instrument = instrumentBySymbol(symbol);
  const { candles, quote } = useMarketFeed(instrument, timeframe, live);

  const notify = useCallback((message: string, tone: Toast["tone"] = "neutral") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  const paper = usePaperTrading(symbol, quote.price, (message) => notify(message, "positive"));

  useEffect(() => saveLocal("crossph-markets:drawings:v1", drawingsBySymbol), [drawingsBySymbol]);
  useEffect(() => saveLocal("crossph-markets:alerts:v1", alerts), [alerts]);

  useEffect(() => {
    setAlerts((current) => {
      let changed = false;
      const next = current.map((alert) => {
        if (alert.triggered || alert.symbol !== symbol) return alert;
        const triggered = alert.condition === "above" ? quote.price >= alert.price : quote.price <= alert.price;
        if (!triggered) return alert;
        changed = true;
        notify(`${alert.symbol} crossed ${alert.condition} ${formatPrice(alert.price)}`, "positive");
        return { ...alert, triggered: true };
      });
      return changed ? next : current;
    });
  }, [notify, quote.price, symbol]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches("input, select, textarea")) return;
      if (event.key === "/") {
        event.preventDefault();
        (document.querySelector(".symbol-search select") as HTMLSelectElement | null)?.focus();
      }
      if (event.key.toLowerCase() === "d") setRailExpanded((value) => !value);
      if (event.key.toLowerCase() === "r") setResetToken((value) => value + 1);
      if (event.key.toLowerCase() === "v") setTool("pan");
      if (event.key.toLowerCase() === "t") setTool("trend");
      if (event.key.toLowerCase() === "b") setTool("rectangle");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const drawings = drawingsBySymbol[symbol] ?? [];
  const current = candles.at(-1);
  const previous = candles.at(-2);
  const marks = useMemo(() => Object.fromEntries(instruments.map((item) => [item.symbol, item.symbol === symbol ? quote.price : item.basePrice])), [quote.price, symbol]);

  const setDrawings = (next: Drawing[]) => setDrawingsBySymbol((currentMap) => ({ ...currentMap, [symbol]: next }));
  const clearDrawings = () => {
    if (!drawings.length || window.confirm(`Clear all ${symbol} drawings?`)) setDrawings([]);
  };
  const fullscreen = () => {
    if (!document.fullscreenElement) workspaceRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <main className="terminal-shell">
      <TopBar
        symbol={symbol}
        timeframe={timeframe}
        mode={mode}
        indicators={indicators}
        live={live}
        onSymbolChange={setSymbol}
        onTimeframeChange={setTimeframe}
        onModeChange={setMode}
        onIndicatorChange={(key) => setIndicators((currentSettings) => ({ ...currentSettings, [key]: !currentSettings[key] }))}
        onLiveChange={() => setLive(!live)}
        onToggleSide={() => setSideOpen(!sideOpen)}
        onFullscreen={fullscreen}
      />

      <section className="terminal-workspace" ref={workspaceRef}>
        <DrawingRail
          expanded={railExpanded}
          active={tool}
          onExpandedChange={() => setRailExpanded(!railExpanded)}
          onToolChange={setTool}
          onClear={clearDrawings}
        />

        <section className="chart-workspace">
          <header className="instrument-header">
            <div className="instrument-title">
              <span className="instrument-badge">{instrument.symbol.slice(0, 2)}</span>
              <div><h1>{instrument.symbol}</h1><p>{instrument.name} · {instrument.exchange}</p></div>
              <button aria-label={favorite ? "Remove favorite" : "Add favorite"} onClick={() => setFavorite(!favorite)}>{favorite ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}</button>
            </div>
            <div className="instrument-price">
              <strong>{formatPrice(quote.price, instrument.precision)}</strong>
              <span className={quote.changePercent >= 0 ? "positive" : "negative"}>
                {quote.change >= 0 ? "+" : ""}{formatPrice(quote.change, instrument.precision)} · {formatSignedPercent(quote.changePercent)}
              </span>
            </div>
            <div className="quote-metrics">
              <div><span>Bid</span><strong>{formatPrice(quote.bid, instrument.precision)}</strong></div>
              <div><span>Ask</span><strong>{formatPrice(quote.ask, instrument.precision)}</strong></div>
              <div><span>Volume</span><strong>{formatCompact(quote.volume)}</strong></div>
            </div>
          </header>

          <div className="chart-toolbar">
            <div className="ohlc-strip">
              <span>O <b>{current ? formatPrice(current.open, instrument.precision) : "—"}</b></span>
              <span>H <b>{current ? formatPrice(current.high, instrument.precision) : "—"}</b></span>
              <span>L <b>{current ? formatPrice(current.low, instrument.precision) : "—"}</b></span>
              <span>C <b>{current ? formatPrice(current.close, instrument.precision) : "—"}</b></span>
              <span>Vol <b>{current ? formatCompact(current.volume) : "—"}</b></span>
              <span className={current && previous && current.close >= previous.close ? "positive" : "negative"}>● {live ? "streaming demo" : "paused"}</span>
            </div>
            <div>
              <button className={grid ? "is-active" : ""} onClick={() => setGrid(!grid)} title="Toggle grid"><Grid3X3 size={15} /></button>
              <button onClick={() => setResetToken((value) => value + 1)} title="Fit chart"><RotateCcw size={15} /></button>
              <button onClick={() => setRailExpanded(!railExpanded)} title="Drawing tools"><Wrench size={15} /></button>
            </div>
          </div>

          <div className="chart-region">
            <MarketChart
              candles={candles}
              mode={mode}
              indicators={indicators}
              grid={grid}
              tool={tool}
              drawings={drawings}
              onDrawingsChange={setDrawings}
              onToolChange={setTool}
              resetToken={resetToken}
            />
            <div className="chart-watermark"><span>Crosspoint</span><strong>Markets</strong></div>
            <div className="active-tool">Tool: <strong>{tool}</strong> · {tool === "pan" ? "Drag to pan · Wheel to zoom" : "Click and drag on chart"}</div>
          </div>

          <BottomDock state={paper.state} marks={marks} onCancel={paper.cancelOrder} onReset={paper.reset} />
        </section>

        <SideWorkspace
          open={sideOpen}
          activeInstrument={instrument}
          quote={quote}
          alerts={alerts}
          onClose={() => setSideOpen(false)}
          onSymbolChange={setSymbol}
          onAlertsChange={setAlerts}
          onOrder={paper.placeOrder}
          onNotify={notify}
        />
      </section>

      <footer className="statusbar">
        <span><i className={live ? "status-dot is-live" : "status-dot"} /> Demo feed {live ? "connected" : "paused"}</span>
        <span>{instrument.assetClass} · {timeframe} · {mode}</span>
        <span>Paper trading only</span>
        <a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">Charts by TradingView Lightweight Charts™</a>
        <time>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ET</time>
      </footer>

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => <div key={toast.id} className={`toast toast--${toast.tone}`}>{toast.message}</div>)}
      </div>
    </main>
  );
}
