# Crosspoint Markets Terminal Design

## Product boundary

Crosspoint Markets Terminal is a separate React application for chart analysis and paper trading. This release runs in the browser with deterministic sample history and a simulated live feed. It does not place real orders, connect to a broker, represent licensed exchange data, or make investment recommendations.

The application uses the Apache-2.0 Lightweight Charts package for the financial canvas and displays its required attribution. The surrounding interface, application code, simulated data, interactions, and drawings are original Crosspoint work.

## Visual thesis

An industrial market workstation: near-black graphite surfaces, crisp hairline structure, warm white data typography, and one electric mint accent. Instrument data is the visual anchor and controls recede until needed.

## Information architecture

- Top command bar: product identity, symbol search, timeframe, chart type, indicators, layout controls, live state, and account actions.
- Left drawing rail: collapsed to an icon strip by default and expandable into a labeled palette.
- Center workspace: instrument header, OHLC strip, financial chart, volume, drawing overlay, status, and range controls.
- Right workspace: watchlist, screener, alerts, news, and paper-order ticket.
- Bottom dock: positions, open orders, order history, and terminal status.
- Mobile: chart-first layout with tool and workspace drawers.

## Functional design

The demo market adapter generates seeded OHLCV history and streams updates into the current bar. Symbols and timeframes are switchable without a page reload. The chart supports candlestick, line, and area modes, pan, zoom, crosshair, reset, auto scale, grid control, and fullscreen. Volume, SMA, EMA, and VWAP are calculated locally.

An SVG layer above the chart supports cursor, trend line, horizontal line, rectangle, Fibonacci retracement, ruler, arrow, text, support/resistance zones, double top, and head-and-shoulders tools. Users can create, select, move, delete, and clear drawings. Drawings persist per symbol in local storage.

The watchlist and screener navigate the chart. Local alerts react to simulated price changes. The paper ticket validates market and limit orders; demo market orders fill immediately, while limit orders wait for price crossings. Positions, open orders, and history are stored locally.

## Component boundaries

- `market/`: types, symbol catalog, seeded data, indicators, and simulator.
- `chart/`: Lightweight Charts lifecycle and financial series.
- `drawings/`: SVG geometry, interactions, selection, and persistence.
- `workspace/`: command bar, drawing rail, watchlist, screener, alerts, news, and bottom dock.
- `paper/`: order form, execution reducer, positions, and persistence.
- `shared/`: accessible controls, formatting, icons, storage, and error handling.

## Accessibility, failure handling, and persistence

Controls have labels, focus rings, and touch-safe targets. Drawers are keyboard dismissible and reduced-motion preferences are respected. Color is not the only status cue. Versioned local-storage values fall back safely if invalid. Chart or storage failures show an actionable message rather than a blank screen.

## Completion criteria

- TypeScript production build and automated tests pass.
- The local app loads without browser console errors.
- Symbol, timeframe, chart type, indicators, and live updates visibly work.
- Core drawing tools create visible drawings that can be selected, moved, deleted, and cleared.
- The drawing rail is collapsed by default and fully opens/closes.
- Watchlist selection, alert creation, paper orders, and the bottom dock work.
- Desktop and mobile layouts have no horizontal overflow.

