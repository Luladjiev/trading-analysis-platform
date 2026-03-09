import { TestBed } from '@angular/core/testing';
import { TradeDataService, TRADE_DATA } from './trade-data.service';
import type { TradeData } from '../../models/trade';

const mockData: TradeData = {
  account: { name: 'Test', number: '123', currency: 'USD', company: 'TestCo' },
  dailySummaries: {
    '2024-01-15': { date: '2024-01-15', tradeCount: 3, netPL: 150.5, trades: [] },
    '2024-01-20': { date: '2024-01-20', tradeCount: 1, netPL: -30, trades: [] },
    '2024-02-05': { date: '2024-02-05', tradeCount: 2, netPL: 80, trades: [] },
  },
  monthlyTotals: {
    '2024-01': { netPL: 120.5, tradeCount: 4 },
    '2024-02': { netPL: 80, tradeCount: 2 },
  },
};

describe('TradeDataService', () => {
  let service: TradeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TRADE_DATA, useValue: mockData }],
    });
    service = TestBed.inject(TradeDataService);
  });

  it('getDailySummary returns correct summary for known date', () => {
    const summary = service.getDailySummary('2024-01-15');
    expect(summary).toBeDefined();
    expect(summary!.netPL).toBe(150.5);
    expect(summary!.tradeCount).toBe(3);
  });

  it('getDailySummary returns undefined for unknown date', () => {
    expect(service.getDailySummary('2099-01-01')).toBeUndefined();
  });

  it('getMonthlyTotal returns correct total for known month', () => {
    const total = service.getMonthlyTotal('2024-01');
    expect(total).toBeDefined();
    expect(total!.netPL).toBe(120.5);
    expect(total!.tradeCount).toBe(4);
  });

  it('getMonthlyTotal returns undefined for unknown month', () => {
    expect(service.getMonthlyTotal('2099-01')).toBeUndefined();
  });

  it('getDailySummariesForMonth filters entries by year/month', () => {
    const result = service.getDailySummariesForMonth(2024, 1);
    const keys = Object.keys(result);
    expect(keys).toHaveLength(2);
    expect(keys).toContain('2024-01-15');
    expect(keys).toContain('2024-01-20');
  });

  it('getDailySummariesForMonth returns empty object for month with no data', () => {
    const result = service.getDailySummariesForMonth(2099, 6);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('getAvailableMonths returns sorted month keys', () => {
    expect(service.getAvailableMonths()).toEqual(['2024-01', '2024-02']);
  });

  it('account returns account info from data', () => {
    expect(service.account).toEqual({
      name: 'Test',
      number: '123',
      currency: 'USD',
      company: 'TestCo',
    });
  });
});
