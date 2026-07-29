# Crosspoint Markets Terminal Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in the current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an original local React trading-analysis terminal with open-source charting, simulated live data, interactive drawing tools, and paper-trading workflows.

**Architecture:** A Vite React/TypeScript single-page application composes market, chart/drawing, workspace, and paper-trading features. Lightweight Charts owns financial rendering, an SVG interaction layer owns annotations, and versioned browser storage owns local user state.

**Tech Stack:** React, TypeScript, Vite, Lightweight Charts 5.2, Vitest, browser local storage, responsive CSS.

---

### Task 1: Project shell and market domain

**Files:** `package.json`, TypeScript/Vite configuration, `src/market/*`, `src/shared/*`

- [x] Configure strict TypeScript, development, build, and test scripts.
- [x] Add seeded symbols, deterministic OHLCV generation, formatting, and storage helpers.
- [x] Implement SMA, EMA, and VWAP with unit tests.
- [x] Implement the simulated live market hook.

### Task 2: Chart and drawings

**Files:** `src/chart/*`, `src/drawings/*`

- [x] Create responsive Lightweight Charts candlestick, line, area, volume, and indicator series.
- [x] Synchronize live updates and chart controls.
- [x] Create SVG drawing shapes, pointer gestures, selection, movement, deletion, and local persistence.
- [x] Test drawing geometry and bounds.

### Task 3: Terminal workspace

**Files:** `src/workspace/*`, `src/styles.css`

- [x] Build the top command bar and collapsed-by-default drawing rail.
- [x] Build instrument summary, chart toolbar, watchlist, screener, alerts, and sample news.
- [x] Build the responsive side workspace and bottom dock.
- [x] Apply the graphite/mint original visual system with accessible focus and reduced motion.

### Task 4: Paper trading and application composition

**Files:** `src/paper/*`, `src/App.tsx`

- [x] Validate and simulate market and limit orders.
- [x] Calculate positions, average entry, open orders, and history.
- [x] Connect alerts and pending orders to simulated quotes.
- [x] Add keyboard shortcuts, notifications, local persistence, and demo-data labels.

### Task 5: Verification and documentation

**Files:** `README.md`, browser smoke test

- [x] Run automated tests and the production build.
- [x] Start Vite locally and verify chart, tools, drawers, alerts, and paper orders in Chromium.
- [x] Check desktop/mobile layout and browser console output.
- [x] Document setup, architecture, open-source attribution, limitations, and backend integration points.
