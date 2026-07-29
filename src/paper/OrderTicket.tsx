import { useEffect, useState } from "react";
import type { OrderInput } from "./usePaperTrading";
import type { OrderSide, OrderType } from "./types";
import { formatPrice } from "../shared/format";

interface Props {
  symbol: string;
  price: number;
  precision: number;
  onSubmit: (order: OrderInput) => { ok: boolean; message: string };
  onNotify: (message: string, tone?: "positive" | "negative") => void;
}

export function OrderTicket({ symbol, price, precision, onSubmit, onNotify }: Props) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState("10");
  const [limitPrice, setLimitPrice] = useState(price.toFixed(precision));
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  useEffect(() => setLimitPrice(price.toFixed(precision)), [price, precision, symbol]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onSubmit({
      symbol,
      side,
      type,
      quantity: Number(quantity),
      limitPrice: type === "limit" ? Number(limitPrice) : undefined,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
    });
    onNotify(result.message, result.ok ? "positive" : "negative");
  };

  const notional = Number(quantity || 0) * (type === "limit" ? Number(limitPrice || 0) : price);

  return (
    <form className="order-ticket" onSubmit={submit}>
      <div className="segmented order-side">
        <button type="button" className={side === "buy" ? "is-buy" : ""} onClick={() => setSide("buy")}>Buy</button>
        <button type="button" className={side === "sell" ? "is-sell" : ""} onClick={() => setSide("sell")}>Sell</button>
      </div>
      <div className="quote-pair">
        <div><span>Bid</span><strong>{formatPrice(price * 0.9998, precision)}</strong></div>
        <div><span>Ask</span><strong>{formatPrice(price * 1.0002, precision)}</strong></div>
      </div>
      <label>
        Order type
        <select value={type} onChange={(event) => setType(event.target.value as OrderType)}>
          <option value="market">Market</option>
          <option value="limit">Limit</option>
        </select>
      </label>
      <label>
        Quantity
        <input value={quantity} inputMode="decimal" onChange={(event) => setQuantity(event.target.value)} />
      </label>
      {type === "limit" && (
        <label>
          Limit price
          <input value={limitPrice} inputMode="decimal" onChange={(event) => setLimitPrice(event.target.value)} />
        </label>
      )}
      <div className="ticket-grid">
        <label>
          Stop loss
          <input placeholder="Optional" value={stopLoss} inputMode="decimal" onChange={(event) => setStopLoss(event.target.value)} />
        </label>
        <label>
          Take profit
          <input placeholder="Optional" value={takeProfit} inputMode="decimal" onChange={(event) => setTakeProfit(event.target.value)} />
        </label>
      </div>
      <div className="ticket-summary">
        <span>Estimated notional</span>
        <strong>${formatPrice(Number.isFinite(notional) ? notional : 0, 2)}</strong>
      </div>
      <button className={`primary-order primary-order--${side}`} type="submit">
        Paper {side === "buy" ? "Buy" : "Sell"} {symbol}
      </button>
      <p className="demo-note">Simulation only. No real order will be transmitted.</p>
    </form>
  );
}
