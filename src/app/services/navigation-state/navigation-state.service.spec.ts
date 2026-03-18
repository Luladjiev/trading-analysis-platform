import { TestBed } from '@angular/core/testing';
import { NavigationStateService } from './navigation-state.service';
import { TRADE_DATA } from '../trade-data/trade-data.service';
import type { TradeData } from '../../models/trade';

const mockData: TradeData = {
  account: { name: 'Test', number: '123', currency: 'USD', company: 'TestCo' },
  dailySummaries: {},
  monthlyTotals: {
    '2024-01': { netPL: 120.5, tradeCount: 4 },
    '2024-02': { netPL: 80, tradeCount: 2 },
    '2024-11': { netPL: -50, tradeCount: 3 },
  },
};

describe('NavigationStateService', () => {
  let service: NavigationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TRADE_DATA, useValue: mockData }],
    });
    service = TestBed.inject(NavigationStateService);
  });

  it('initializes to the last available month', () => {
    expect(service.currentYear()).toBe(2024);
    expect(service.currentMonth()).toBe(11);
  });

  it('setMonth updates year and month', () => {
    service.setMonth(2025, 6);
    expect(service.currentYear()).toBe(2025);
    expect(service.currentMonth()).toBe(6);
  });

  it('navigateMonth increments month', () => {
    service.setMonth(2024, 3);
    service.navigateMonth(1);
    expect(service.currentYear()).toBe(2024);
    expect(service.currentMonth()).toBe(4);
  });

  it('navigateMonth decrements month', () => {
    service.setMonth(2024, 3);
    service.navigateMonth(-1);
    expect(service.currentYear()).toBe(2024);
    expect(service.currentMonth()).toBe(2);
  });

  it('navigateMonth wraps from December to January of next year', () => {
    service.setMonth(2024, 12);
    service.navigateMonth(1);
    expect(service.currentYear()).toBe(2025);
    expect(service.currentMonth()).toBe(1);
  });

  it('navigateMonth wraps from January to December of previous year', () => {
    service.setMonth(2024, 1);
    service.navigateMonth(-1);
    expect(service.currentYear()).toBe(2023);
    expect(service.currentMonth()).toBe(12);
  });

  it('navigateYear increments year', () => {
    service.setMonth(2024, 5);
    service.navigateYear(1);
    expect(service.currentYear()).toBe(2025);
    expect(service.currentMonth()).toBe(5);
  });

  it('navigateYear decrements year', () => {
    service.setMonth(2024, 5);
    service.navigateYear(-1);
    expect(service.currentYear()).toBe(2023);
    expect(service.currentMonth()).toBe(5);
  });
});
