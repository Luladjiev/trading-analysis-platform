import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TradeDataService } from '../../services/trade-data/trade-data.service';
import { CalendarHeader } from '../calendar-header/calendar-header';
import { type CalendarDaySlot, CalendarGrid } from '../calendar-grid/calendar-grid';
import { CalendarYearlyGrid } from '../calendar-yearly-grid/calendar-yearly-grid';
import { TradeListDialog } from '../trade-list-dialog/trade-list-dialog';
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
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, CalendarHeader, CalendarGrid, CalendarYearlyGrid, TradeListDialog],
  templateUrl: './calendar-page.html',
})
export class CalendarPage {
  private readonly tradeData = inject(TradeDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly currency = this.tradeData.account.currency;

  readonly selectedDaySummary = signal<DailySummary | null>(null);
  readonly currentYear = signal(0);
  readonly currentMonth = signal(0);
  readonly viewMode = signal<'monthly' | 'yearly'>('monthly');

  constructor() {
    const months = this.tradeData.getAvailableMonths();
    const params = this.route.snapshot.queryParams;
    const qYear = Number(params['year']);
    const qMonth = Number(params['month']);
    const qView = params['view'];

    if (qYear > 0 && qMonth >= 1 && qMonth <= 12) {
      this.currentYear.set(qYear);
      this.currentMonth.set(qMonth);
    } else if (months.length > 0) {
      const last = months[months.length - 1];
      const [y, m] = last.split('-').map(Number);
      this.currentYear.set(y);
      this.currentMonth.set(m);
    }

    if (qView === 'yearly') {
      this.viewMode.set('yearly');
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

  protected readonly calendarWeeks = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Monday=0 ... Sunday=6
    const startDow = (firstDay.getDay() + 6) % 7;

    const today = new Date();
    const todayKey =
      today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1;

    const weeks: CalendarDaySlot[][] = [];
    let currentWeek: CalendarDaySlot[] = [];

    // Leading empty slots
    for (let i = 0; i < startDow; i++) {
      currentWeek.push({ day: null, dateKey: null, isToday: false, isWeekend: i >= 5 });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dow = (startDow + d - 1) % 7;
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      currentWeek.push({
        day: d,
        dateKey,
        isToday: d === todayKey,
        isWeekend: dow >= 5,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Trailing empty slots
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const dow = currentWeek.length;
        currentWeek.push({ day: null, dateKey: null, isToday: false, isWeekend: dow >= 5 });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  });

  setViewMode(mode: 'monthly' | 'yearly') {
    this.viewMode.set(mode);
    this.updateQueryParams();
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
    this.updateQueryParams();
  }

  navigateYear(delta: number) {
    this.currentYear.update((y) => y + delta);
    this.updateQueryParams();
  }

  navigateToMonth(event: { year: number; month: number }) {
    this.currentYear.set(event.year);
    this.currentMonth.set(event.month);
    this.viewMode.set('monthly');
    this.updateQueryParams();
  }

  private updateQueryParams() {
    const params: Record<string, string | number> = {
      year: this.currentYear(),
      month: this.currentMonth(),
    };
    if (this.viewMode() === 'yearly') {
      params['view'] = 'yearly';
    }
    this.router.navigate([], { queryParams: params, replaceUrl: true });
  }
}
