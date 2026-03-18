import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TradeDataService } from '../../services/trade-data/trade-data.service';
import { NavigationStateService } from '../../services/navigation-state/navigation-state.service';
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
  private readonly nav = inject(NavigationStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly currency = this.tradeData.account.currency;

  readonly selectedDaySummary = signal<DailySummary | null>(null);
  readonly currentYear = this.nav.currentYear;
  readonly currentMonth = this.nav.currentMonth;
  readonly viewMode = signal<'monthly' | 'yearly'>('monthly');

  constructor() {
    const qView = this.route.snapshot.queryParams['view'];
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
    this.nav.navigateMonth(delta);
    this.updateQueryParams();
  }

  navigateYear(delta: number) {
    this.nav.navigateYear(delta);
    this.updateQueryParams();
  }

  navigateToMonth(event: { year: number; month: number }) {
    this.nav.setMonth(event.year, event.month);
    this.viewMode.set('monthly');
    this.updateQueryParams();
  }

  private updateQueryParams() {
    const params: Record<string, string | number> = {};
    if (this.viewMode() === 'yearly') {
      params['view'] = 'yearly';
    }
    this.router.navigate([], { queryParams: params, replaceUrl: true });
  }
}
