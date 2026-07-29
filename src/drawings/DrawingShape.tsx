import type { Drawing } from "./types";
import { normalizeBounds } from "./geometry";

interface Props {
  drawing: Drawing;
  selected: boolean;
  width: number;
}

const patternPoints = (drawing: Drawing, headAndShoulders: boolean) => {
  const { x, y, width, height } = normalizeBounds(drawing.start, drawing.end);
  const base = y + height;
  if (headAndShoulders) {
    return `${x},${base} ${x + width * 0.18},${y + height * 0.45} ${x + width * 0.35},${base} ${x + width * 0.5},${y} ${x + width * 0.65},${base} ${x + width * 0.82},${y + height * 0.45} ${x + width},${base}`;
  }
  return `${x},${base} ${x + width * 0.25},${y} ${x + width * 0.5},${base} ${x + width * 0.75},${y} ${x + width},${base}`;
};

export function DrawingShape({ drawing, selected, width }: Props) {
  const { start, end, tool } = drawing;
  const bounds = normalizeBounds(start, end);
  const accent = tool === "support" ? "#5ef0bd" : tool === "resistance" ? "#ff6b7a" : "#8fc8ff";
  const stroke = selected ? "#fff4cf" : accent;
  const common = { stroke, strokeWidth: selected ? 2 : 1.5, vectorEffect: "non-scaling-stroke" as const };

  let shape: React.ReactNode;
  if (tool === "horizontal") {
    shape = <line x1={0} y1={start.y} x2={width} y2={start.y} {...common} strokeDasharray="6 5" />;
  } else if (["rectangle", "support", "resistance"].includes(tool)) {
    shape = (
      <rect
        x={bounds.x}
        y={bounds.y}
        width={Math.max(1, bounds.width)}
        height={Math.max(1, bounds.height)}
        {...common}
        fill={tool === "support" ? "rgba(94,240,189,.10)" : tool === "resistance" ? "rgba(255,107,122,.10)" : "rgba(143,200,255,.08)"}
      />
    );
  } else if (tool === "fib") {
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 1];
    shape = (
      <g>
        <rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} fill="rgba(143,200,255,.04)" stroke="none" />
        {levels.map((level) => {
          const y = start.y + (end.y - start.y) * level;
          return (
            <g key={level}>
              <line x1={start.x} y1={y} x2={end.x} y2={y} {...common} opacity={0.85} />
              <text x={Math.min(start.x, end.x) + 5} y={y - 4} className="drawing-label">{level.toFixed(3)}</text>
            </g>
          );
        })}
      </g>
    );
  } else if (tool === "ruler") {
    shape = (
      <g>
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} {...common} strokeDasharray="4 4" />
        <rect x={end.x - 58} y={end.y - 25} width={116} height={20} rx={3} fill="#14191f" stroke={stroke} />
        <text x={end.x} y={end.y - 11} textAnchor="middle" className="drawing-label">
          Δ {Math.round(end.x - start.x)} × {Math.round(start.y - end.y)}
        </text>
      </g>
    );
  } else if (tool === "text") {
    shape = (
      <g>
        <circle cx={start.x} cy={start.y} r={3} fill={stroke} />
        <text x={start.x + 8} y={start.y - 8} className="drawing-text">{drawing.label ?? "Market note"}</text>
      </g>
    );
  } else if (tool === "doubleTop" || tool === "headShoulders") {
    shape = <polyline points={patternPoints(drawing, tool === "headShoulders")} fill="none" {...common} />;
  } else {
    shape = (
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        {...common}
        markerEnd={tool === "arrow" ? "url(#drawing-arrow)" : undefined}
      />
    );
  }

  return (
    <g data-drawing-id={drawing.id}>
      {shape}
      {selected && (
        <>
          <circle cx={start.x} cy={start.y} r={5} className="drawing-handle" />
          {tool !== "horizontal" && <circle cx={end.x} cy={end.y} r={5} className="drawing-handle" />}
        </>
      )}
    </g>
  );
}
