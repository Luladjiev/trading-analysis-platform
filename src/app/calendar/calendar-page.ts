import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { TradeDataService } from '../services/trade-data.service';
import { CalendarHeader } from './calendar-header';
import { CalendarGrid, type CalendarDaySlot } from './calendar-grid';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarHeader, CalendarGrid],
  template: `
    <div class="mx-auto max-w-4xl px-4 py-6">
      <app-calendar-header
        [monthLabel]="monthLabel()"
        [year]="currentYear()"
        [monthlyTotal]="monthlyTotal()"
        [currency]="currency"
        (previousMonth)="navigateMonth(-1)"
        (nextMonth)="navigateMonth(1)"
      />
      <app-calendar-grid
        [weeks]="calendarWeeks()"
        [dailySummaries]="monthSummaries()"
        [currency]="currency"
      />
    </div>
  `,
})
export class CalendarPage {
  private readonly tradeData = inject(TradeDataService);
  readonly currency = this.tradeData.account.currency;

  readonly currentYear = signal(0);
  readonly currentMonth = signal(0);

  constructor() {
    const months = this.tradeData.getAvailableMonths();
    if (months.length > 0) {
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

  protected readonly calendarWeeks = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Monday=0 ... Sunday=6
    let startDow = (firstDay.getDay() + 6) % 7;

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
}
