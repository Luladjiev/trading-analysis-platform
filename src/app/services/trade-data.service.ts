import { Injectable } from '@angular/core';
import type { TradeData, DailySummary, MonthlyTotal, AccountInfo } from '../models/trade';
import data from '../../assets/trade-data.json';

const tradeData = data as TradeData;

@Injectable({ providedIn: 'root' })
export class TradeDataService {
  readonly account: AccountInfo = tradeData.account;

  getDailySummary(dateKey: string): DailySummary | undefined {
    return tradeData.dailySummaries[dateKey];
  }

  getMonthlyTotal(monthKey: string): MonthlyTotal | undefined {
    return tradeData.monthlyTotals[monthKey];
  }

  getDailySummariesForMonth(year: number, month: number): Record<string, DailySummary> {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const result: Record<string, DailySummary> = {};
    for (const [key, summary] of Object.entries(tradeData.dailySummaries)) {
      if (key.startsWith(prefix)) {
        result[key] = summary;
      }
    }
    return result;
  }

  getAvailableMonths(): string[] {
    return Object.keys(tradeData.monthlyTotals).sort();
  }
}
