export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface PaperOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  createdAt: number;
  filledAt?: number;
  filledPrice?: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface PaperState {
  cash: number;
  orders: PaperOrder[];
  positions: Position[];
}
