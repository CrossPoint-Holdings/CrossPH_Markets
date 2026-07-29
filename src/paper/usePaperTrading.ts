import { useCallback, useEffect, useState } from "react";
import { applyFill, initialPaperState, shouldFillLimit } from "./paperEngine";
import type { OrderSide, OrderType, PaperOrder, PaperState } from "./types";
import { loadLocal, saveLocal } from "../shared/storage";

const key = "crossph-markets:paper:v1";

export interface OrderInput {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export function usePaperTrading(symbol: string, price: number, onFill: (message: string) => void) {
  const [state, setState] = useState<PaperState>(() => loadLocal(key, initialPaperState));

  useEffect(() => saveLocal(key, state), [state]);

  useEffect(() => {
    setState((current) => {
      const fillable = current.orders.filter((order) => order.symbol === symbol && shouldFillLimit(order, price));
      if (!fillable.length) return current;
      let next = current;
      fillable.forEach((order) => {
        next = applyFill(next, order, price);
        onFill(`${order.side.toUpperCase()} limit filled: ${order.quantity} ${order.symbol}`);
      });
      return next;
    });
  }, [onFill, price, symbol]);

  const placeOrder = useCallback(
    (input: OrderInput) => {
      if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { ok: false, message: "Enter a valid quantity." };
      if (input.type === "limit" && (!input.limitPrice || input.limitPrice <= 0)) return { ok: false, message: "Enter a valid limit price." };
      const order: PaperOrder = {
        ...input,
        id: crypto.randomUUID(),
        status: "open",
        createdAt: Date.now(),
      };
      setState((current) =>
        input.type === "market" ? applyFill(current, order, price) : { ...current, orders: [order, ...current.orders] },
      );
      return {
        ok: true,
        message: input.type === "market" ? `${input.side.toUpperCase()} paper order filled.` : "Limit order placed.",
      };
    },
    [price],
  );

  const cancelOrder = (id: string) =>
    setState((current) => ({
      ...current,
      orders: current.orders.map((order) => (order.id === id ? { ...order, status: "cancelled" } : order)),
    }));

  const reset = () => setState(initialPaperState);

  return { state, placeOrder, cancelOrder, reset };
}
