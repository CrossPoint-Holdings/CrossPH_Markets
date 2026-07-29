import { Activity, Bell, Expand, PanelRight, Search, Settings2 } from "lucide-react";
import { instruments } from "../market/catalog";
import type { ChartMode, IndicatorSettings, Timeframe } from "../market/types";

interface Props {
  symbol: string;
  timeframe: Timeframe;
  mode: ChartMode;
  indicators: IndicatorSettings;
  live: boolean;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onModeChange: (mode: ChartMode) => void;
  onIndicatorChange: (key: keyof IndicatorSettings) => void;
  onLiveChange: () => void;
  onToggleSide: () => void;
  onFullscreen: () => void;
}

const timeframes: Timeframe[] = ["1m", "5m", "15m", "1h", "1D"];

export function TopBar(props: Props) {
  return (
    <header className="topbar">
      <div className="brand-mark" aria-label="Crosspoint Markets">
        <span className="brand-glyph">CP</span>
        <span className="brand-name">Crosspoint <b>Markets</b></span>
      </div>
      <div className="symbol-search">
        <Search size={15} />
        <select aria-label="Market symbol" value={props.symbol} onChange={(event) => props.onSymbolChange(event.target.value)}>
          {instruments.map((instrument) => <option value={instrument.symbol} key={instrument.symbol}>{instrument.symbol} · {instrument.name}</option>)}
        </select>
        <kbd>/</kbd>
      </div>
      <div className="timeframe-list" aria-label="Chart timeframe">
        {timeframes.map((timeframe) => (
          <button key={timeframe} className={props.timeframe === timeframe ? "is-active" : ""} onClick={() => props.onTimeframeChange(timeframe)}>
            {timeframe}
          </button>
        ))}
      </div>
      <select className="chart-type" aria-label="Chart type" value={props.mode} onChange={(event) => props.onModeChange(event.target.value as ChartMode)}>
        <option value="candles">Candles</option>
        <option value="line">Line</option>
        <option value="area">Area</option>
      </select>
      <div className="indicator-list">
        {(Object.keys(props.indicators) as Array<keyof IndicatorSettings>).map((indicator) => (
          <button
            key={indicator}
            className={props.indicators[indicator] ? "is-active" : ""}
            onClick={() => props.onIndicatorChange(indicator)}
            title={`Toggle ${indicator.toUpperCase()}`}
          >
            {indicator.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="topbar-actions">
        <button className={`live-toggle ${props.live ? "is-live" : ""}`} onClick={props.onLiveChange}><Activity size={14} /> {props.live ? "Live" : "Paused"}</button>
        <button title="Alerts"><Bell size={16} /></button>
        <button title="Settings"><Settings2 size={16} /></button>
        <button title="Fullscreen chart" onClick={props.onFullscreen}><Expand size={16} /></button>
        <button title="Toggle right workspace" onClick={props.onToggleSide}><PanelRight size={16} /></button>
      </div>
    </header>
  );
}
