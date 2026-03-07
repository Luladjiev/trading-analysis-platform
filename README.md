# Trading Calendar

A trading performance analysis platform that visualizes MetaTrader 5 trading history. Built with Angular 21, Tailwind CSS, and server-side prerendering (SSG).

## Prerequisites

- Node.js 20+
- An MT5 trade history report exported as `.xlsx`

## Setup

```bash
npm install
```

## Generating trade data

The app reads from a static JSON file (`src/assets/trade-data.json`) generated from an MT5 xlsx report.

### Exporting from MetaTrader 5

1. Open MT5 and go to the **History** tab
2. Right-click and select the desired date range
3. Right-click again and choose **Report** > **Open XML (xlsx)**
4. Save the file as `report.xlsx` in the project root

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

Produces a prerendered static site in `dist/trading-calendar/`.

## Tests

```bash
npm test
```
