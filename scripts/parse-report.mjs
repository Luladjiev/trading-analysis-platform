import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const reportPath = process.argv[2] ? resolve(process.argv[2]) : join(projectRoot, 'report.xlsx');

const wb = XLSX.readFile(reportPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

function detectFormat(rows) {
  if (rows[2]?.[0] === 'Futures Position History') return 'binance';
  if (rows.some((r) => r[0] === 'Positions')) return 'metatrader';
  throw new Error('Unknown report format: could not detect Binance or MetaTrader');
}

function parseMetaTrader(rows) {
  const name = rows[1]?.[3] ?? '';
  const accountRaw = String(rows[2]?.[3] ?? '');
  const accountMatch = accountRaw.match(/^(\d+)\s*\((\w+),/);
  const account = {
    name,
    number: accountMatch?.[1] ?? '',
    currency: accountMatch?.[2] ?? '',
    company: rows[3]?.[3] ?? '',
  };

  const positionsStart = rows.findIndex((r) => r[0] === 'Positions');
  const ordersStart = rows.findIndex((r) => r[0] === 'Orders');

  if (positionsStart === -1 || ordersStart === -1) {
    console.error('Could not find Positions or Orders section');
    process.exit(1);
  }

  const trades = [];
  const dataStart = positionsStart + 2;

  for (let i = dataStart; i < ordersStart; i++) {
    const row = rows[i];
    if (!row || !row[0]) continue;

    const closeTimeStr = String(row[8]);
    const date = closeTimeStr.slice(0, 10).replace(/\./g, '-');
    const symbol = String(row[2]);
    const type = String(row[3]).toLowerCase();
    const volume = parseFloat(String(row[4])) || 0;
    const commission = parseFloat(String(row[10])) || 0;
    const swap = parseFloat(String(row[11])) || 0;
    const profit = parseFloat(String(row[12])) || 0;

    trades.push({ date, symbol, type, volume, commission, swap, profit });
  }

  return { account, trades };
}

function parseBinance(rows) {
  const account = {
    name: String(rows[4]?.[1] ?? ''),
    number: String(rows[5]?.[1] ?? ''),
    currency: '$',
    company: 'Binance',
  };

  const trades = [];

  for (let i = 10; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[0]) break;

    const status = String(row[14] ?? '');
    if (status === 'Partially Closed') continue;

    const closedTimeStr = String(row[12] ?? '');
    if (!closedTimeStr) continue;

    const date = '20' + closedTimeStr.slice(0, 8);
    const symbol = String(row[0]);
    const type = String(row[2]).toLowerCase() === 'short' ? 'sell' : 'buy';
    const volume = parseFloat(String(row[8])) || 0;
    const commission = 0;
    const swap = 0;
    const profit = parseFloat(String(row[9])) || 0;

    if (profit === 0) continue;

    trades.push({ date, symbol, type, volume, commission, swap, profit });
  }

  return { account, trades };
}

const format = detectFormat(rows);
const { account, trades } = format === 'binance' ? parseBinance(rows) : parseMetaTrader(rows);

console.log(`Detected format: ${format}`);

// Aggregate trades into daily summaries
const dailySummaries = {};

for (const { date, symbol, type, volume, commission, swap, profit } of trades) {
  const netPL = round(commission + swap + profit);
  const trade = { symbol, type, volume, commission, swap, profit, netPL };

  if (!dailySummaries[date]) {
    dailySummaries[date] = { date, tradeCount: 0, netPL: 0, trades: [] };
  }

  dailySummaries[date].trades.push(trade);
  dailySummaries[date].tradeCount++;
  dailySummaries[date].netPL = round(dailySummaries[date].netPL + netPL);
}

// Compute monthly totals
const monthlyTotals = {};
for (const summary of Object.values(dailySummaries)) {
  const monthKey = summary.date.slice(0, 7);
  if (!monthlyTotals[monthKey]) {
    monthlyTotals[monthKey] = { netPL: 0, tradeCount: 0 };
  }
  monthlyTotals[monthKey].netPL = round(monthlyTotals[monthKey].netPL + summary.netPL);
  monthlyTotals[monthKey].tradeCount += summary.tradeCount;
}

const output = { account, dailySummaries, monthlyTotals };
const outPath = join(projectRoot, 'src', 'assets', 'trade-data.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(
  `Parsed ${Object.values(dailySummaries).reduce((s, d) => s + d.tradeCount, 0)} trades across ${Object.keys(dailySummaries).length} days`,
);
console.log(`Months: ${Object.keys(monthlyTotals).join(', ')}`);
console.log(`Output: ${outPath}`);

function round(n) {
  return Math.round(n * 100) / 100;
}
