import { Injectable } from '@angular/core';
import type { DailySummary, TradingStats } from '../../models/trade';

@Injectable({ providedIn: 'root' })
export class TradingStatsService {
  computeStats(summaries: Record<string, DailySummary>, year: number, month: number): TradingStats {
    const trades: { netPL: number; type: string; date: string }[] = [];

    for (const [dateKey, summary] of Object.entries(summaries)) {
      for (const trade of summary.trades) {
        trades.push({ netPL: trade.netPL, type: trade.type, date: dateKey });
      }
    }

    const totalTrades = trades.length;

    if (totalTrades === 0) {
      return {
        grossProfit: 0,
        grossLoss: 0,
        winRate: 0,
        winCount: 0,
        lossCount: 0,
        highestWin: null,
        highestLoss: null,
        tradesPerWeek: 0,
        totalTrades: 0,
        longCount: 0,
        shortCount: 0,
        profitFactor: 0,
      };
    }

    const wins = trades.filter((t) => t.netPL > 0);
    const losses = trades.filter((t) => t.netPL < 0);

    const grossProfit = wins.reduce((sum, t) => sum + t.netPL, 0);
    const grossLoss = losses.reduce((sum, t) => sum + t.netPL, 0);

    const winCount = wins.length;
    const lossCount = losses.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

    let highestWin: { amount: number; date: string } | null = null;
    if (wins.length > 0) {
      const best = wins.reduce((a, b) => (a.netPL > b.netPL ? a : b));
      highestWin = { amount: best.netPL, date: best.date };
    }

    let highestLoss: { amount: number; date: string } | null = null;
    if (losses.length > 0) {
      const worst = losses.reduce((a, b) => (a.netPL < b.netPL ? a : b));
      highestLoss = { amount: worst.netPL, date: worst.date };
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const weeksInMonth = daysInMonth / 7;
    const tradesPerWeek = weeksInMonth > 0 ? totalTrades / weeksInMonth : 0;

    const longCount = trades.filter((t) => t.type === 'buy').length;
    const shortCount = trades.filter((t) => t.type === 'sell').length;

    const absGrossLoss = Math.abs(grossLoss);
    const profitFactor =
      absGrossLoss > 0 ? grossProfit / absGrossLoss : grossProfit > 0 ? Infinity : 0;

    return {
      grossProfit,
      grossLoss,
      winRate,
      winCount,
      lossCount,
      highestWin,
      highestLoss,
      tradesPerWeek,
      totalTrades,
      longCount,
      shortCount,
      profitFactor,
    };
  }
}
