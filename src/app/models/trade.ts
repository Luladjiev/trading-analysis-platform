export interface AccountInfo {
  name: string;
  number: string;
  currency: string;
  company: string;
}

export interface Trade {
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  commission: number;
  swap: number;
  profit: number;
  netPL: number;
}

export interface DailySummary {
  date: string;
  tradeCount: number;
  netPL: number;
  trades: Trade[];
}

export interface MonthlyTotal {
  netPL: number;
  tradeCount: number;
}

export interface TradingStats {
  grossProfit: number;
  grossLoss: number;
  winRate: number;
  winCount: number;
  lossCount: number;
  highestWin: { amount: number; date: string } | null;
  highestLoss: { amount: number; date: string } | null;
  tradesPerWeek: number;
  totalTrades: number;
  longCount: number;
  shortCount: number;
  profitFactor: number;
}

export interface TradeData {
  account: AccountInfo;
  dailySummaries: Record<string, DailySummary>;
  monthlyTotals: Record<string, MonthlyTotal>;
}
