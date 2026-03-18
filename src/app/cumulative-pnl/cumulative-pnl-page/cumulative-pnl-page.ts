import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TradeDataService } from '../../services/trade-data/trade-data.service';
import { NavigationStateService } from '../../services/navigation-state/navigation-state.service';
import { CalendarHeader } from '../../calendar/calendar-header/calendar-header';
import { PnlChart } from '../../calendar/pnl-chart/pnl-chart';
import { TradeListDialog } from '../../calendar/trade-list-dialog/trade-list-dialog';
import type { DailySummary } from '../../models/trade';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Component({
  selector: 'app-cumulative-pnl-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, CalendarHeader, PnlChart, TradeListDialog],
  templateUrl: './cumulative-pnl-page.html',
})
export class CumulativePnlPage {
  private readonly tradeData = inject(TradeDataService);
  protected readonly nav = inject(NavigationStateService);
  readonly currency = this.tradeData.account.currency;

  readonly selectedDaySummary = signal<DailySummary | null>(null);
  readonly currentYear = this.nav.currentYear;
  readonly currentMonth = this.nav.currentMonth;
  readonly viewMode = this.nav.viewMode;

  protected readonly monthLabel = computed(() => MONTH_NAMES[this.currentMonth() - 1] ?? '');

  protected readonly monthKey = computed(
    () => `${this.currentYear()}-${String(this.currentMonth()).padStart(2, '0')}`,
  );

  protected readonly monthlyTotal = computed(() => this.tradeData.getMonthlyTotal(this.monthKey()));

  protected readonly monthSummaries = computed(() =>
    this.tradeData.getDailySummariesForMonth(this.currentYear(), this.currentMonth()),
  );

  protected readonly previousMonthSummaries = computed(() => {
    let y = this.currentYear();
    let m = this.currentMonth() - 1;
    if (m < 1) {
      m = 12;
      y--;
    }
    return this.tradeData.getDailySummariesForMonth(y, m);
  });

  protected readonly previousMonthLabel = computed(() => {
    let y = this.currentYear();
    let m = this.currentMonth() - 1;
    if (m < 1) {
      m = 12;
      y--;
    }
    return `${MONTH_NAMES[m - 1]} ${y}`;
  });

  protected readonly yearlyDailySummaries = computed(() =>
    this.tradeData.getDailySummariesForYear(this.currentYear()),
  );

  protected readonly yearlyTotals = computed(() =>
    this.tradeData.getMonthlyTotalsForYear(this.currentYear()),
  );

  protected readonly yearlyNetPL = computed(() => {
    const totals = this.yearlyTotals();
    return Object.values(totals).reduce((sum, t) => sum + t.netPL, 0);
  });

  protected readonly yearlyTradeCount = computed(() => {
    const totals = this.yearlyTotals();
    return Object.values(totals).reduce((sum, t) => sum + t.tradeCount, 0);
  });

  protected readonly previousYearDailySummaries = computed(() =>
    this.tradeData.getDailySummariesForYear(this.currentYear() - 1),
  );

  protected readonly previousYearLabel = computed(() => `${this.currentYear() - 1}`);

  setViewMode(mode: 'monthly' | 'yearly') {
    this.nav.viewMode.set(mode);
  }

  navigateMonth(delta: number) {
    this.nav.navigateMonth(delta);
  }

  navigateYear(delta: number) {
    this.nav.navigateYear(delta);
  }
}
