import { inject, Injectable, signal } from '@angular/core';
import { TradeDataService } from '../trade-data/trade-data.service';

@Injectable({ providedIn: 'root' })
export class NavigationStateService {
  private readonly tradeData = inject(TradeDataService);

  readonly currentYear = signal(0);
  readonly currentMonth = signal(0);
  readonly viewMode = signal<'monthly' | 'yearly'>('monthly');

  constructor() {
    const months = this.tradeData.getAvailableMonths();
    if (months.length > 0) {
      const last = months[months.length - 1];
      const [y, m] = last.split('-').map(Number);
      this.currentYear.set(y);
      this.currentMonth.set(m);
    }
  }

  setMonth(year: number, month: number) {
    this.currentYear.set(year);
    this.currentMonth.set(month);
  }

  navigateMonth(delta: number) {
    let m = this.currentMonth() + delta;
    let y = this.currentYear();
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    this.currentYear.set(y);
    this.currentMonth.set(m);
  }

  navigateYear(delta: number) {
    this.currentYear.update((y) => y + delta);
  }
}
