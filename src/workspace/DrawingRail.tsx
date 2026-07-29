import {
  ArrowDownRight,
  BetweenHorizontalStart,
  BoxSelect,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  FoldHorizontal,
  Heading,
  Minus,
  MousePointer2,
  Move,
  Ruler,
  TextCursorInput,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { DrawingTool } from "../drawings/types";

interface Props {
  expanded: boolean;
  active: DrawingTool;
  onExpandedChange: () => void;
  onToolChange: (tool: DrawingTool) => void;
  onClear: () => void;
}

const tools: Array<{ id: DrawingTool; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "pan", label: "Pan / Zoom", icon: Move },
  { id: "cursor", label: "Select", icon: MousePointer2 },
  { id: "trend", label: "Trend line", icon: TrendingUp },
  { id: "horizontal", label: "Horizontal", icon: Minus },
  { id: "rectangle", label: "Box", icon: BoxSelect },
  { id: "fib", label: "Fib retracement", icon: FoldHorizontal },
  { id: "ruler", label: "Price range", icon: Ruler },
  { id: "arrow", label: "Arrow", icon: ArrowDownRight },
  { id: "text", label: "Text note", icon: TextCursorInput },
  { id: "support", label: "Support zone", icon: BetweenHorizontalStart },
  { id: "resistance", label: "Resistance zone", icon: Crosshair },
  { id: "doubleTop", label: "Double top", icon: Heading },
  { id: "headShoulders", label: "Head & shoulders", icon: Heading },
];

export function DrawingRail({ expanded, active, onExpandedChange, onToolChange, onClear }: Props) {
  return (
    <aside className={`drawing-rail ${expanded ? "is-expanded" : ""}`}>
      <div className="rail-heading">
        {expanded && <span>Drawing tools</span>}
        <button aria-label={expanded ? "Collapse drawing tools" : "Expand drawing tools"} onClick={onExpandedChange}>
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      <div className="rail-tools">
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={active === id ? "is-active" : ""}
            aria-label={label}
            title={label}
            onClick={() => onToolChange(id)}
          >
            <Icon size={17} />
            {expanded && <span>{label}</span>}
          </button>
        ))}
      </div>
      <button className="rail-clear" title="Clear drawings" aria-label="Clear all drawings" onClick={onClear}>
        <Trash2 size={16} />
        {expanded && <span>Clear all</span>}
      </button>
    </aside>
  );
}
