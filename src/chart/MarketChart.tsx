import { useEffect, useRef } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle, ChartMode, IndicatorSettings } from "../market/types";
import { ema, sma, vwap } from "../market/indicators";
import { DrawingLayer } from "../drawings/DrawingLayer";
import type { Drawing, DrawingTool } from "../drawings/types";

interface Props {
  candles: Candle[];
  mode: ChartMode;
  indicators: IndicatorSettings;
  grid: boolean;
  tool: DrawingTool;
  drawings: Drawing[];
  onDrawingsChange: (drawings: Drawing[]) => void;
  onToolChange: (tool: DrawingTool) => void;
  resetToken: number;
}

const asTime = (time: number) => time as UTCTimestamp;

export function MarketChart({
  candles,
  mode,
  indicators,
  grid,
  tool,
  drawings,
  onDrawingsChange,
  onToolChange,
  resetToken,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const smaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const vwapRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const chart = createChart(hostRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#0b0e11" },
        textColor: "#7f8995",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        attributionLogo: true,
        panes: {
          separatorColor: "#232931",
          separatorHoverColor: "#3a4652",
          enableResize: true,
        },
      },
      grid: {
        vertLines: { color: grid ? "#191e24" : "transparent" },
        horzLines: { color: grid ? "#191e24" : "transparent" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#5d6977", labelBackgroundColor: "#24303a" },
        horzLine: { color: "#5d6977", labelBackgroundColor: "#24303a" },
      },
      rightPriceScale: { borderColor: "#242a31", scaleMargins: { top: 0.08, bottom: 0.08 } },
      timeScale: { borderColor: "#242a31", timeVisible: true, secondsVisible: false, rightOffset: 8, barSpacing: 7 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    chartRef.current = chart;

    if (mode === "candles") {
      mainRef.current = chart.addSeries(CandlestickSeries, {
        upColor: "#5ef0bd",
        downColor: "#ff6b7a",
        wickUpColor: "#5ef0bd",
        wickDownColor: "#ff6b7a",
        borderVisible: false,
      });
    } else if (mode === "line") {
      mainRef.current = chart.addSeries(LineSeries, { color: "#8fc8ff", lineWidth: 2 });
    } else {
      mainRef.current = chart.addSeries(AreaSeries, {
        lineColor: "#5ef0bd",
        lineWidth: 2,
        topColor: "rgba(94,240,189,.28)",
        bottomColor: "rgba(94,240,189,.01)",
      });
    }

    volumeRef.current = chart.addSeries(
      HistogramSeries,
      { priceFormat: { type: "volume" }, priceScaleId: "", lastValueVisible: false, priceLineVisible: false },
      1,
    );
    chart.panes()[1]?.setHeight(105);
    smaRef.current = chart.addSeries(LineSeries, { color: "#f1c96a", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    emaRef.current = chart.addSeries(LineSeries, { color: "#8fc8ff", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    vwapRef.current = chart.addSeries(LineSeries, { color: "#c7a7ff", lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

    return () => {
      chart.remove();
      chartRef.current = null;
      mainRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    if (!mainRef.current || !volumeRef.current) return;
    if (mode === "candles") {
      (mainRef.current as ISeriesApi<"Candlestick">).setData(
        candles.map((candle) => ({ ...candle, time: asTime(candle.time) })),
      );
    } else {
      (mainRef.current as ISeriesApi<"Line" | "Area">).setData(
        candles.map((candle) => ({ time: asTime(candle.time), value: candle.close })),
      );
    }
    volumeRef.current.setData(
      candles.map((candle) => ({
        time: asTime(candle.time),
        value: candle.volume,
        color: candle.close >= candle.open ? "rgba(94,240,189,.42)" : "rgba(255,107,122,.42)",
      })),
    );
    smaRef.current?.setData(indicators.sma ? sma(candles, 20).map((point) => ({ ...point, time: asTime(point.time) })) : []);
    emaRef.current?.setData(indicators.ema ? ema(candles, 12).map((point) => ({ ...point, time: asTime(point.time) })) : []);
    vwapRef.current?.setData(indicators.vwap ? vwap(candles).map((point) => ({ ...point, time: asTime(point.time) })) : []);
    volumeRef.current.applyOptions({ visible: indicators.volume });
  }, [candles, indicators, mode]);

  useEffect(() => {
    chartRef.current?.applyOptions({
      grid: {
        vertLines: { color: grid ? "#191e24" : "transparent" },
        horzLines: { color: grid ? "#191e24" : "transparent" },
      },
    });
  }, [grid]);

  useEffect(() => {
    chartRef.current?.timeScale().fitContent();
  }, [resetToken]);

  return (
    <div className="chart-stack">
      <div ref={hostRef} className="chart-canvas" />
      <DrawingLayer
        tool={tool}
        drawings={drawings}
        onChange={onDrawingsChange}
        onToolChange={onToolChange}
      />
    </div>
  );
}
