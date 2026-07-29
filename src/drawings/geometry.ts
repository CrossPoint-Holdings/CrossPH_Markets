import type { Drawing, Point } from "./types";

export const normalizeBounds = (start: Point, end: Point) => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

const distanceToSegment = (point: Point, start: Point, end: Point) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
};

export function hitDrawing(drawing: Drawing, point: Point, tolerance = 10) {
  if (["trend", "arrow", "ruler"].includes(drawing.tool)) {
    return distanceToSegment(point, drawing.start, drawing.end) <= tolerance;
  }
  if (drawing.tool === "horizontal") return Math.abs(point.y - drawing.start.y) <= tolerance;
  const bounds = normalizeBounds(drawing.start, drawing.end);
  return (
    point.x >= bounds.x - tolerance &&
    point.x <= bounds.x + bounds.width + tolerance &&
    point.y >= bounds.y - tolerance &&
    point.y <= bounds.y + bounds.height + tolerance
  );
}
