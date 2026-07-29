import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, X } from "lucide-react";
import type { PaperState } from "../paper/types";
import { formatPrice } from "../shared/format";

interface Props {
  state: PaperState;
  marks: Record<string, number>;
  onCancel: (id: string) => void;
  onReset: () => void;
}

type DockTab = "positions" | "orders" | "history";

export function BottomDock({ state, marks, onCancel, onReset }: Props) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<DockTab>("positions");
  const equity = state.cash + state.positions.reduce((sum, position) => sum + position.quantity * (marks[position.symbol] ?? position.averagePrice), 0);

  return (
    <section className={`bottom-dock ${open ? "is-open" : ""}`}>
      <div className="dock-tabs">
        <button className={tab === "positions" ? "is-active" : ""} onClick={() => { setTab("positions"); setOpen(true); }}>Positions <span>{state.positions.length}</span></button>
        <button className={tab === "orders" ? "is-active" : ""} onClick={() => { setTab("orders"); setOpen(true); }}>Open orders <span>{state.orders.filter((order) => order.status === "open").length}</span></button>
        <button className={tab === "history" ? "is-active" : ""} onClick={() => { setTab("history"); setOpen(true); }}>History</button>
        <div className="account-balance"><span>Paper equity</span><strong>${formatPrice(equity)}</strong></div>
        <button title="Reset paper account" onClick={onReset}><RotateCcw size={14} /></button>
        <button aria-label={open ? "Collapse bottom dock" : "Expand bottom dock"} onClick={() => setOpen(!open)}>{open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
      </div>
      {open && (
        <div className="dock-content">
          {tab === "positions" && (
            <>
              <div className="table-row table-head"><span>Symbol</span><span>Quantity</span><span>Avg. entry</span><span>Mark</span><span>Unrealized P/L</span></div>
              {!state.positions.length && <div className="empty-state">No paper positions. Open the Trade tab to place a simulated order.</div>}
              {state.positions.map((position) => {
                const mark = marks[position.symbol] ?? position.averagePrice;
                const pnl = (mark - position.averagePrice) * position.quantity;
                return (
                  <div className="table-row" key={position.symbol}>
                    <strong>{position.symbol}</strong><span>{position.quantity}</span><span>${formatPrice(position.averagePrice)}</span><span>${formatPrice(mark)}</span>
                    <span className={pnl >= 0 ? "positive" : "negative"}>{pnl >= 0 ? "+" : ""}${formatPrice(pnl)}</span>
                  </div>
                );
              })}
            </>
          )}
          {tab === "orders" && (
            <>
              <div className="table-row table-head"><span>Symbol</span><span>Side</span><span>Type</span><span>Quantity</span><span>Limit</span><span /></div>
              {state.orders.filter((order) => order.status === "open").map((order) => (
                <div className="table-row" key={order.id}>
                  <strong>{order.symbol}</strong><span className={order.side === "buy" ? "positive" : "negative"}>{order.side.toUpperCase()}</span><span>{order.type}</span><span>{order.quantity}</span><span>{order.limitPrice ? `$${formatPrice(order.limitPrice)}` : "Market"}</span>
                  <button aria-label="Cancel order" onClick={() => onCancel(order.id)}><X size={14} /></button>
                </div>
              ))}
              {!state.orders.some((order) => order.status === "open") && <div className="empty-state">No open paper orders.</div>}
            </>
          )}
          {tab === "history" && (
            <>
              <div className="table-row table-head"><span>Time</span><span>Symbol</span><span>Side</span><span>Quantity</span><span>Status</span><span>Price</span></div>
              {state.orders.map((order) => (
                <div className="table-row" key={order.id}>
                  <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><strong>{order.symbol}</strong><span>{order.side.toUpperCase()}</span><span>{order.quantity}</span><span>{order.status}</span><span>{order.filledPrice ? `$${formatPrice(order.filledPrice)}` : "—"}</span>
                </div>
              ))}
              {!state.orders.length && <div className="empty-state">Paper order history will appear here.</div>}
            </>
          )}
        </div>
      )}
    </section>
  );
}
