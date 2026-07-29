import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DrawingShape } from "./DrawingShape";
import { hitDrawing } from "./geometry";
import type { Drawing, DrawingTool, Point } from "./types";

interface Props {
  tool: DrawingTool;
  drawings: Drawing[];
  onChange: (drawings: Drawing[]) => void;
  onToolChange: (tool: DrawingTool) => void;
}

interface DragState {
  mode: "create" | "move";
  origin: Point;
  drawing?: Drawing;
}

export function DrawingLayer({ tool, drawings, onChange, onToolChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draft, setDraft] = useState<Drawing | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const size = useMemo(() => ({ width: svgRef.current?.clientWidth ?? 1600 }), [drawings, draft]);

  const pointFromEvent = (event: React.PointerEvent): Point => {
    const bounds = svgRef.current!.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (tool === "pan") return;
    const point = pointFromEvent(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (tool === "cursor") {
      const match = [...drawings].reverse().find((drawing) => hitDrawing(drawing, point));
      setSelectedId(match?.id ?? null);
      if (match) setDrag({ mode: "move", origin: point, drawing: match });
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const drawing: Drawing = {
      id,
      tool,
      start: point,
      end: tool === "horizontal" || tool === "text" ? point : point,
      label: tool === "text" ? "Market note" : undefined,
    };
    setDraft(drawing);
    setDrag({ mode: "create", origin: point, drawing });
    setSelectedId(id);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const point = pointFromEvent(event);
    if (drag.mode === "create" && draft) {
      setDraft({ ...draft, end: point });
      return;
    }
    if (drag.mode === "move" && drag.drawing) {
      const dx = point.x - drag.origin.x;
      const dy = point.y - drag.origin.y;
      const updated = {
        ...drag.drawing,
        start: { x: drag.drawing.start.x + dx, y: drag.drawing.start.y + dy },
        end: { x: drag.drawing.end.x + dx, y: drag.drawing.end.y + dy },
      };
      onChange(drawings.map((drawing) => (drawing.id === updated.id ? updated : drawing)));
    }
  };

  const finishPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    if (drag?.mode === "create" && draft) {
      const distance = Math.hypot(draft.end.x - draft.start.x, draft.end.y - draft.start.y);
      if (distance > 5 || ["horizontal", "text"].includes(draft.tool)) onChange([...drawings, draft]);
      setDraft(null);
      if (!event.shiftKey) onToolChange("cursor");
    }
    setDrag(null);
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    onChange(drawings.filter((drawing) => drawing.id !== selectedId));
    setSelectedId(null);
  }, [drawings, onChange, selectedId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        deleteSelected();
      }
      if (event.key === "Escape") {
        setDraft(null);
        setDrag(null);
        setSelectedId(null);
        onToolChange("pan");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected, onToolChange, selectedId]);

  return (
    <svg
      ref={svgRef}
      className={`drawing-layer drawing-layer--${tool}`}
      aria-label="Interactive chart drawings"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
    >
      <defs>
        <marker id="drawing-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#8fc8ff" />
        </marker>
      </defs>
      {drawings.map((drawing) => (
        <DrawingShape key={drawing.id} drawing={drawing} selected={selectedId === drawing.id} width={size.width} />
      ))}
      {draft && <DrawingShape drawing={draft} selected width={size.width} />}
    </svg>
  );
}
