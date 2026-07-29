import type { PaperOrder, PaperState, Position } from "./types";

export const initialPaperState: PaperState = {
  cash: 100000,
  orders: [],
  positions: [],
};

export function applyFill(state: PaperState, order: PaperOrder, price: number, now = Date.now()): PaperState {
  const signedQuantity = order.side === "buy" ? order.quantity : -order.quantity;
  const existing = state.positions.find((position) => position.symbol === order.symbol);
  let positions: Position[];

  if (!existing) {
    positions = [...state.positions, { symbol: order.symbol, quantity: signedQuantity, averagePrice: price }];
  } else {
    const nextQuantity = existing.quantity + signedQuantity;
    const increasesSameDirection =
      (existing.quantity >= 0 && signedQuantity > 0) || (existing.quantity <= 0 && signedQuantity < 0);
    const averagePrice = increasesSameDirection
      ? (Math.abs(existing.quantity) * existing.averagePrice + Math.abs(signedQuantity) * price) /
        Math.max(1, Math.abs(existing.quantity) + Math.abs(signedQuantity))
      : existing.averagePrice;
    positions = state.positions
      .map((position) =>
        position.symbol === order.symbol ? { ...position, quantity: nextQuantity, averagePrice } : position,
      )
      .filter((position) => Math.abs(position.quantity) > 0.000001);
  }

  const filled: PaperOrder = { ...order, status: "filled", filledPrice: price, filledAt: now };
  const existingOrder = state.orders.some((candidate) => candidate.id === order.id);
  return {
    cash: state.cash - signedQuantity * price,
    positions,
    orders: existingOrder
      ? state.orders.map((candidate) => (candidate.id === order.id ? filled : candidate))
      : [filled, ...state.orders],
  };
}

export const shouldFillLimit = (order: PaperOrder, price: number) =>
  order.type === "limit" &&
  order.status === "open" &&
  order.limitPrice !== undefined &&
  (order.side === "buy" ? price <= order.limitPrice : price >= order.limitPrice);
