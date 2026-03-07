import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const reportPath = process.argv[2]
  ? resolve(process.argv[2])
  : join(projectRoot, 'report.xlsx');

const wb = XLSX.readFile(reportPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Parse account info from rows 0-4
const name = rows[1]?.[3] ?? '';
const accountRaw = String(rows[2]?.[3] ?? '');
const accountMatch = accountRaw.match(/^(\d+)\s*\((\w+),/);
const account = {
  name,
  number: accountMatch?.[1] ?? '',
  currency: accountMatch?.[2] ?? '',
  company: rows[3]?.[3] ?? '',
};

// Find Positions section boundaries
const positionsStart = rows.findIndex((r) => r[0] === 'Positions');
const ordersStart = rows.findIndex((r) => r[0] === 'Orders');

if (positionsStart === -1 || ordersStart === -1) {
  console.error('Could not find Positions or Orders section');
  process.exit(1);
}

// Position data rows start after the header row (positionsStart + 2)
const dataStart = positionsStart + 2;
const dailySummaries = {};

for (let i = dataStart; i < ordersStart; i++) {
  const row = rows[i];
  if (!row || !row[0]) continue;

  // Close time is column 8
  const closeTimeStr = String(row[8]);
  const dateKey = closeTimeStr.slice(0, 10).replace(/\./g, '-');

  const symbol = String(row[2]);
  const type = String(row[3]).toLowerCase();
  const volume = parseFloat(String(row[4])) || 0;
  const commission = parseFloat(String(row[10])) || 0;
  const swap = parseFloat(String(row[11])) || 0;
  const profit = parseFloat(String(row[12])) || 0;
  const netPL = round(commission + swap + profit);

  const trade = { symbol, type, volume, commission, swap, profit, netPL };

  if (!dailySummaries[dateKey]) {
    dailySummaries[dateKey] = { date: dateKey, tradeCount: 0, netPL: 0, trades: [] };
  }

  dailySummaries[dateKey].trades.push(trade);
  dailySummaries[dateKey].tradeCount++;
  dailySummaries[dateKey].netPL = round(dailySummaries[dateKey].netPL + netPL);
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

console.log(`Parsed ${Object.values(dailySummaries).reduce((s, d) => s + d.tradeCount, 0)} trades across ${Object.keys(dailySummaries).length} days`);
console.log(`Months: ${Object.keys(monthlyTotals).join(', ')}`);
console.log(`Output: ${outPath}`);

function round(n) {
  return Math.round(n * 100) / 100;
}
