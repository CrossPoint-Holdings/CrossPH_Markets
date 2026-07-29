import { useMemo, useState } from "react";
import { BellRing, BriefcaseBusiness, ChartNoAxesCombined, Newspaper, Plus, X } from "lucide-react";
import { instruments } from "../market/catalog";
import type { Instrument, Quote } from "../market/types";
import { formatCompact, formatPrice, formatSignedPercent } from "../shared/format";
import { OrderTicket } from "../paper/OrderTicket";
import type { OrderInput } from "../paper/usePaperTrading";

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: "above" | "below";
  price: number;
  triggered: boolean;
}

interface Props {
  open: boolean;
  activeInstrument: Instrument;
  quote: Quote;
  alerts: PriceAlert[];
  onClose: () => void;
  onSymbolChange: (symbol: string) => void;
  onAlertsChange: (alerts: PriceAlert[]) => void;
  onOrder: (order: OrderInput) => { ok: boolean; message: string };
  onNotify: (message: string, tone?: "positive" | "negative") => void;
}

type Tab = "watchlist" | "screener" | "alerts" | "news" | "trade";

const sampleNews = [
  { time: "10:42", source: "Market desk", headline: "Semiconductors lead technology shares in active morning trade" },
  { time: "09:58", source: "Macro brief", headline: "Treasury yields steady as investors review the latest data" },
  { time: "09:31", source: "Opening note", headline: "Major U.S. indices open mixed; volume builds in growth names" },
  { time: "08:15", source: "Earnings watch", headline: "Large-cap companies remain in focus ahead of results" },
];

const syntheticQuote = (instrument: Instrument) => {
  const seed = [...instrument.symbol].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const changePercent = ((seed % 47) - 19) / 10;
  return { price: instrument.basePrice * (1 + changePercent / 100), changePercent };
};

export function SideWorkspace(props: Props) {
  const [tab, setTab] = useState<Tab>("watchlist");
  const [filter, setFilter] = useState("");
  const [alertPrice, setAlertPrice] = useState(props.quote.price.toFixed(props.activeInstrument.precision));
  const [condition, setCondition] = useState<"above" | "below">("above");

  const filtered = useMemo(
    () =>
      instruments.filter((instrument) =>
        `${instrument.symbol} ${instrument.name} ${instrument.sector}`.toLowerCase().includes(filter.toLowerCase()),
      ),
    [filter],
  );

  const addAlert = () => {
    const price = Number(alertPrice);
    if (!Number.isFinite(price) || price <= 0) {
      props.onNotify("Enter a valid alert price.", "negative");
      return;
    }
    props.onAlertsChange([
      ...props.alerts,
      { id: crypto.randomUUID(), symbol: props.activeInstrument.symbol, condition, price, triggered: false },
    ]);
    props.onNotify("Local price alert created.", "positive");
  };

  const tabs: Array<{ id: Tab; icon: React.ComponentType<{ size?: number }>; label: string }> = [
    { id: "watchlist", icon: BriefcaseBusiness, label: "Watch" },
    { id: "screener", icon: ChartNoAxesCombined, label: "Screen" },
    { id: "alerts", icon: BellRing, label: "Alerts" },
    { id: "news", icon: Newspaper, label: "News" },
    { id: "trade", icon: Plus, label: "Trade" },
  ];

  return (
    <aside className={`side-workspace ${props.open ? "is-open" : ""}`}>
      <div className="side-tabs">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)} title={label}>
            <Icon size={15} /><span>{label}</span>
          </button>
        ))}
        <button className="side-close" aria-label="Close workspace" onClick={props.onClose}><X size={16} /></button>
      </div>

      {tab === "watchlist" && (
        <div className="side-panel">
          <div className="panel-title"><div><span>Personal list</span><strong>Market watch</strong></div><button><Plus size={15} /></button></div>
          <input className="panel-search" placeholder="Filter symbols…" value={filter} onChange={(event) => setFilter(event.target.value)} />
          <div className="watch-header"><span>Symbol</span><span>Last</span><span>Change</span></div>
          <div className="watch-list">
            {filtered.map((instrument) => {
              const synthetic = instrument.symbol === props.quote.symbol
                ? { price: props.quote.price, changePercent: props.quote.changePercent }
                : syntheticQuote(instrument);
              return (
                <button
                  key={instrument.symbol}
                  className={instrument.symbol === props.activeInstrument.symbol ? "is-active" : ""}
                  onClick={() => props.onSymbolChange(instrument.symbol)}
                >
                  <span><b>{instrument.symbol}</b><small>{instrument.exchange}</small></span>
                  <span>{formatPrice(synthetic.price, instrument.precision)}</span>
                  <span className={synthetic.changePercent >= 0 ? "positive" : "negative"}>{formatSignedPercent(synthetic.changePercent)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "screener" && (
        <div className="side-panel">
          <div className="panel-title"><div><span>Demo universe</span><strong>Market screener</strong></div></div>
          <input className="panel-search" placeholder="Symbol, sector, asset…" value={filter} onChange={(event) => setFilter(event.target.value)} />
          <div className="screener-list">
            {filtered.map((instrument) => {
              const synthetic = syntheticQuote(instrument);
              return (
                <button key={instrument.symbol} onClick={() => props.onSymbolChange(instrument.symbol)}>
                  <div><strong>{instrument.symbol}</strong><span>{instrument.sector}</span></div>
                  <div><strong>{formatSignedPercent(synthetic.changePercent)}</strong><span>{formatCompact(870000 + instrument.basePrice * 15000)} vol</span></div>
                </button>
              );
            })}
          </div>
          <p className="demo-note">Demonstration screener values. Not exchange data.</p>
        </div>
      )}

      {tab === "alerts" && (
        <div className="side-panel">
          <div className="panel-title"><div><span>Local monitor</span><strong>Price alerts</strong></div></div>
          <div className="alert-builder">
            <div className="ticket-grid">
              <label>Condition<select value={condition} onChange={(event) => setCondition(event.target.value as "above" | "below")}><option value="above">Crosses above</option><option value="below">Crosses below</option></select></label>
              <label>Price<input value={alertPrice} onChange={(event) => setAlertPrice(event.target.value)} inputMode="decimal" /></label>
            </div>
            <button className="secondary-action" onClick={addAlert}>Create alert</button>
          </div>
          <div className="alert-list">
            {!props.alerts.length && <div className="empty-state">No local alerts yet.</div>}
            {props.alerts.map((alert) => (
              <div key={alert.id} className={alert.triggered ? "is-triggered" : ""}>
                <span><strong>{alert.symbol}</strong><small>{alert.condition} {formatPrice(alert.price, 2)}</small></span>
                <span>{alert.triggered ? "Triggered" : "Watching"}</span>
                <button aria-label="Delete alert" onClick={() => props.onAlertsChange(props.alerts.filter((candidate) => candidate.id !== alert.id))}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "news" && (
        <div className="side-panel">
          <div className="panel-title"><div><span>Sample content</span><strong>Market brief</strong></div></div>
          <div className="news-list">
            {sampleNews.map((item) => (
              <article key={item.time}>
                <div><time>{item.time}</time><span>{item.source}</span></div>
                <h3>{item.headline}</h3>
              </article>
            ))}
          </div>
          <p className="demo-note">Placeholder headlines for interface demonstration.</p>
        </div>
      )}

      {tab === "trade" && (
        <div className="side-panel">
          <div className="panel-title"><div><span>Practice account</span><strong>{props.activeInstrument.symbol} order ticket</strong></div></div>
          <OrderTicket
            symbol={props.activeInstrument.symbol}
            price={props.quote.price}
            precision={props.activeInstrument.precision}
            onSubmit={props.onOrder}
            onNotify={props.onNotify}
          />
        </div>
      )}
    </aside>
  );
}
