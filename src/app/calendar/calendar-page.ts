import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TradeDataService } from '../services/trade-data.service';
import { CalendarHeader } from './calendar-header';
import { type CalendarDaySlot, CalendarGrid } from './calendar-grid';
import { PnlChart } from './pnl-chart';
import { TradeListDialog } from './trade-list-dialog';
import type { DailySummary } from '../models/trade';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarHeader, CalendarGrid, PnlChart, TradeListDialog],
  template: `
    <main class="flex flex-col flex-1 px-6 py-6 lg:px-12 max-w-[1400px] mx-auto w-full">
      <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <app-calendar-header
          [monthLabel]="monthLabel()"
          [year]="currentYear()"
          [monthlyTotal]="monthlyTotal()"
          [currency]="currency"
        />
        <div class="flex flex-col gap-6 items-end w-full md:w-auto">
          <div class="flex bg-cool-grey/40 p-1 rounded-lg" role="tablist" aria-label="View mode">
            <button
              role="tab"
              [attr.aria-selected]="view() === 'calendar'"
              [class]="view() === 'calendar'
                ? 'px-6 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20 tracking-wider'
                : 'px-6 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wider'"
              (click)="view.set('calendar')"
            >
              CALENDAR
            </button>
            <button
              role="tab"
              [attr.aria-selected]="view() === 'chart'"
              [class]="view() === 'chart'
                ? 'px-6 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20 tracking-wider'
                : 'px-6 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors tracking-wider'"
              (click)="view.set('chart')"
            >
              CUMULATIVE P/L
            </button>
          </div>
          <div class="flex gap-2">
            <button
              (click)="navigateMonth(-1)"
              aria-label="Previous month"
              class="flex items-center gap-2 px-5 py-2.5 bg-cool-grey/40 hover:bg-cool-grey/60 text-white text-xs font-bold uppercase tracking-widest transition-all border border-white/5"
            >
              &larr; Prev
            </button>
            <button
              (click)="navigateMonth(1)"
              aria-label="Next month"
              class="flex items-center gap-2 px-5 py-2.5 bg-cool-grey/40 hover:bg-cool-grey/60 text-white text-xs font-bold uppercase tracking-widest transition-all border border-white/5"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
      @if (view() === 'calendar') {
        <app-calendar-grid
          [weeks]="calendarWeeks()"
          [dailySummaries]="monthSummaries()"
          [currency]="currency"
          (daySelected)="selectedDaySummary.set($event)"
        />
      } @else {
        <app-pnl-chart
          [dailySummaries]="monthSummaries()"
          [currency]="currency"
          [monthLabel]="monthLabel() + ' ' + currentYear()"
          (daySelected)="selectedDaySummary.set($event)"
        />
      }
      @if (selectedDaySummary()) {
        <app-trade-list-dialog
          [summary]="selectedDaySummary()!"
          [currency]="currency"
          (closed)="selectedDaySummary.set(null)"
        />
      }
    </main>
  `,
})
export class CalendarPage {
  private readonly tradeData = inject(TradeDataService);
  readonly currency = this.tradeData.account.currency;

  readonly selectedDaySummary = signal<DailySummary | null>(null);
  readonly view = signal<'calendar' | 'chart'>('calendar');
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
