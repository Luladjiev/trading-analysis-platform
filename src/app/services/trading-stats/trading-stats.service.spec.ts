import { TradingStatsService } from './trading-stats.service';
import type { DailySummary } from '../../models/trade';

describe('TradingStatsService', () => {
  let service: TradingStatsService;

  beforeEach(() => {
    service = new TradingStatsService();
  });

  function makeSummary(date: string, trades: { type: 'buy' | 'sell'; netPL: number }[]): DailySummary {
    return {
      date,
      tradeCount: trades.length,
      netPL: trades.reduce((s, t) => s + t.netPL, 0),
      trades: trades.map(t => ({
        symbol: 'EURUSD',
        type: t.type,
        volume: 1,
        commission: 0,
        swap: 0,
        profit: t.netPL,
        netPL: t.netPL,
      })),
    };
  }

  it('should return zero stats for no trades', () => {
    const stats = service.computeStats({}, 2025, 1);
    expect(stats.totalTrades).toBe(0);
    expect(stats.grossProfit).toBe(0);
    expect(stats.grossLoss).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.highestWin).toBeNull();
    expect(stats.highestLoss).toBeNull();
    expect(stats.profitFactor).toBe(0);
  });

  it('should compute stats correctly with mixed trades', () => {
    const summaries: Record<string, DailySummary> = {
      '2025-01-06': makeSummary('2025-01-06', [
        { type: 'buy', netPL: 100 },
        { type: 'sell', netPL: -50 },
      ]),
      '2025-01-07': makeSummary('2025-01-07', [
        { type: 'buy', netPL: 200 },
        { type: 'sell', netPL: -30 },
      ]),
    };

    const stats = service.computeStats(summaries, 2025, 1);

    expect(stats.totalTrades).toBe(4);
    expect(stats.grossProfit).toBe(300);
    expect(stats.grossLoss).toBe(-80);
    expect(stats.winCount).toBe(2);
    expect(stats.lossCount).toBe(2);
    expect(stats.winRate).toBe(50);
    expect(stats.highestWin).toEqual({ amount: 200, date: '2025-01-07' });
    expect(stats.highestLoss).toEqual({ amount: -50, date: '2025-01-06' });
    expect(stats.longCount).toBe(2);
    expect(stats.shortCount).toBe(2);
    expect(stats.profitFactor).toBeCloseTo(3.75, 2);
  });

  it('should handle all wins', () => {
    const summaries: Record<string, DailySummary> = {
      '2025-03-01': makeSummary('2025-03-01', [
        { type: 'buy', netPL: 50 },
        { type: 'buy', netPL: 100 },
      ]),
    };

    const stats = service.computeStats(summaries, 2025, 3);
    expect(stats.winRate).toBe(100);
    expect(stats.lossCount).toBe(0);
    expect(stats.highestLoss).toBeNull();
    expect(stats.profitFactor).toBe(Infinity);
  });

  it('should handle all losses', () => {
    const summaries: Record<string, DailySummary> = {
      '2025-02-01': makeSummary('2025-02-01', [
        { type: 'sell', netPL: -100 },
        { type: 'sell', netPL: -200 },
      ]),
    };

    const stats = service.computeStats(summaries, 2025, 2);
    expect(stats.winRate).toBe(0);
    expect(stats.winCount).toBe(0);
    expect(stats.highestWin).toBeNull();
    expect(stats.profitFactor).toBe(0);
    expect(stats.grossLoss).toBe(-300);
  });

  it('should compute trades per week based on days in month', () => {
    const summaries: Record<string, DailySummary> = {
      '2025-01-06': makeSummary('2025-01-06', [
        { type: 'buy', netPL: 10 },
      ]),
    };

    const stats = service.computeStats(summaries, 2025, 1);
    // January has 31 days, ~4.43 weeks
    expect(stats.tradesPerWeek).toBeCloseTo(1 / (31 / 7), 2);
  });
});
