import { inject, Injectable, InjectionToken } from '@angular/core';
import type { TradeData, DailySummary, MonthlyTotal, AccountInfo } from '../../models/trade';
import data from '../../../assets/trade-data.json';

export const TRADE_DATA = new InjectionToken<TradeData>('TRADE_DATA', {
  providedIn: 'root',
  factory: () => data as TradeData,
});

@Injectable({ providedIn: 'root' })
export class TradeDataService {
  private readonly data = inject(TRADE_DATA);
  readonly account: AccountInfo = this.data.account;

  getDailySummary(dateKey: string): DailySummary | undefined {
    return this.data.dailySummaries[dateKey];
  }

  getMonthlyTotal(monthKey: string): MonthlyTotal | undefined {
    return this.data.monthlyTotals[monthKey];
  }

  getDailySummariesForMonth(year: number, month: number): Record<string, DailySummary> {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const result: Record<string, DailySummary> = {};
    for (const [key, summary] of Object.entries(this.data.dailySummaries)) {
      if (key.startsWith(prefix)) {
        result[key] = summary;
      }
    }
    return result;
  }

  getDailySummariesForYear(year: number): Record<string, DailySummary> {
    const prefix = `${year}`;
    const result: Record<string, DailySummary> = {};
    for (const [key, summary] of Object.entries(this.data.dailySummaries)) {
      if (key.startsWith(prefix)) {
        result[key] = summary;
      }
    }
    return result;
  }

  getMonthlyTotalsForYear(year: number): Record<string, MonthlyTotal> {
    const prefix = `${year}`;
    const result: Record<string, MonthlyTotal> = {};
    for (const [key, total] of Object.entries(this.data.monthlyTotals)) {
      if (key.startsWith(prefix)) result[key] = total;
    }
    return result;
  }

  getAvailableMonths(): string[] {
    return Object.keys(this.data.monthlyTotals).sort();
  }
}
