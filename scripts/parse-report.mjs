import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import {
  detectFormat,
  parseMetaTrader,
  parseBinance,
  aggregateTrades,
} from './parse-report-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const reportPath = process.argv[2] ? resolve(process.argv[2]) : join(projectRoot, 'report.xlsx');

const wb = XLSX.readFile(reportPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const format = detectFormat(rows);
const { account, trades } = format === 'binance' ? parseBinance(rows) : parseMetaTrader(rows);

console.log(`Detected format: ${format}`);

const { dailySummaries, monthlyTotals } = aggregateTrades(trades);

const output = { account, dailySummaries, monthlyTotals };
const outPath = join(projectRoot, 'src', 'assets', 'trade-data.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(
  `Parsed ${Object.values(dailySummaries).reduce((s, d) => s + d.tradeCount, 0)} trades across ${Object.keys(dailySummaries).length} days`,
);
console.log(`Months: ${Object.keys(monthlyTotals).join(', ')}`);
console.log(`Output: ${outPath}`);
