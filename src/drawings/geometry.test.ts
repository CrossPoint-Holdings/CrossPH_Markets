import { describe, expect, it } from "vitest";
import { hitDrawing, normalizeBounds } from "./geometry";

describe("drawing geometry", () => {
  it("normalizes reverse drag bounds", () => {
    expect(normalizeBounds({ x: 20, y: 30 }, { x: 5, y: 8 })).toEqual({
      x: 5,
      y: 8,
      width: 15,
      height: 22,
    });
  });

  it("hit-tests lines and rectangles", () => {
    expect(hitDrawing({ id: "a", tool: "trend", start: { x: 0, y: 0 }, end: { x: 100, y: 100 } }, { x: 50, y: 54 })).toBe(true);
    expect(hitDrawing({ id: "b", tool: "rectangle", start: { x: 20, y: 20 }, end: { x: 80, y: 80 } }, { x: 40, y: 40 })).toBe(true);
  });
});
