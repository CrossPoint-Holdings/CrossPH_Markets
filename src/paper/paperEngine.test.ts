import { describe, expect, it } from "vitest";
import { applyFill, initialPaperState, shouldFillLimit } from "./paperEngine";
import type { PaperOrder } from "./types";

const order: PaperOrder = {
  id: "o1",
  symbol: "NVDA",
  side: "buy",
  type: "market",
  quantity: 10,
  status: "open",
  createdAt: 1,
};

describe("paper engine", () => {
  it("creates a position and reduces cash", () => {
    const state = applyFill(initialPaperState, order, 100, 2);
    expect(state.cash).toBe(99000);
    expect(state.positions[0]).toMatchObject({ symbol: "NVDA", quantity: 10, averagePrice: 100 });
  });

  it("fills a buy limit only at or below the limit", () => {
    const limit = { ...order, type: "limit" as const, limitPrice: 95 };
    expect(shouldFillLimit(limit, 96)).toBe(false);
    expect(shouldFillLimit(limit, 94)).toBe(true);
  });
});
