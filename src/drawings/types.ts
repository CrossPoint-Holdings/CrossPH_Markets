export type DrawingTool =
  | "pan"
  | "cursor"
  | "trend"
  | "horizontal"
  | "rectangle"
  | "fib"
  | "ruler"
  | "arrow"
  | "text"
  | "support"
  | "resistance"
  | "doubleTop"
  | "headShoulders";

export interface Point {
  x: number;
  y: number;
}

export interface Drawing {
  id: string;
  tool: DrawingTool;
  start: Point;
  end: Point;
  label?: string;
}
