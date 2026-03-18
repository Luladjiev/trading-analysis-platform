# Trading Analysis Platform

A trading performance analysis platform that visualizes trading history from MetaTrader 5 or Binance Futures. Import your trade reports and get interactive dashboards, calendar views, and cumulative P/L charts to analyze your trading performance. Built with Angular 21, Tailwind CSS, and server-side prerendering (SSG).

## Features

- **Overview Dashboard** — Monthly summary with key metrics: gross profit/loss, win rate, profit factor, highest win/loss, trades per week, long/short ratio, and average trade
- **Trading Calendar** — Monthly grid showing daily P/L and trade counts with weekly totals, plus a yearly view summarizing all months at a glance
- **Cumulative P/L Chart** — Interactive area chart tracking cumulative profit/loss over time, with the previous period overlaid for comparison
- **Trade Details** — Click any day or month to view individual trades with symbol, type, volume, commission, swap, and net P/L
- **Multi-format Import** — Auto-detects and parses MetaTrader 5 and Binance Futures `.xlsx` exports

## Prerequisites

- Node.js 20+
- A trade history report exported as `.xlsx` from MetaTrader 5 or Binance Futures

## Setup

```bash
npm install
```

## Generating trade data

The app reads from a static JSON file (`src/assets/trade-data.json`) generated from an exported `.xlsx` report. The parser auto-detects the source format.

### Exporting from MetaTrader 5

1. Open MT5 and go to the **History** tab
2. Right-click and select the desired date range
3. Right-click again and choose **Report** > **Open XML (xlsx)**
4. Save the file as `report.xlsx` in the project root

### Exporting from Binance Futures

1. Go to **Futures** > **Position History**
2. Select the desired date range and export as `.xlsx`
3. Save the file as `report.xlsx` in the project root

### Running the parser

The parser runs automatically before `npm start` and `npm run build` via the `prestart`/`prebuild` scripts. You can also run it manually:

```bash
node scripts/parse-report.mjs                    # uses report.xlsx in project root
node scripts/parse-report.mjs path/to/report.xlsx # custom file path
```

This generates `src/assets/trade-data.json` with daily trade summaries grouped by date and monthly totals.

## Development

```bash
npm start
```

Open `http://localhost:4200/`.

## Build

```bash
npm run build
```

Produces a prerendered static site in `dist/trading-analysis-platform/`.

## Tests

```bash
npm test
```
