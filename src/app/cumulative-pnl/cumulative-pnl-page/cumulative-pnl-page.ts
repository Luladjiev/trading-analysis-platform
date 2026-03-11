import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TradeDataService } from '../../services/trade-data/trade-data.service';
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
  imports: [CalendarHeader, PnlChart, TradeListDialog],
  templateUrl: './cumulative-pnl-page.html',
})
export class CumulativePnlPage {
  private readonly tradeData = inject(TradeDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly currency = this.tradeData.account.currency;

  readonly selectedDaySummary = signal<DailySummary | null>(null);
  readonly currentYear = signal(0);
  readonly currentMonth = signal(0);

  constructor() {
    const months = this.tradeData.getAvailableMonths();
    const params = this.route.snapshot.queryParams;
    const qYear = Number(params['year']);
    const qMonth = Number(params['month']);

    if (qYear > 0 && qMonth >= 1 && qMonth <= 12) {
      this.currentYear.set(qYear);
      this.currentMonth.set(qMonth);
    } else if (months.length > 0) {
      const last = months[months.length - 1];
      const [y, m] = last.split('-').map(Number);
      this.currentYear.set(y);
      this.currentMonth.set(m);
    }
  }

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
    this.router.navigate([], {
      queryParams: { year: y, month: m },
      replaceUrl: true,
    });
  }
}
