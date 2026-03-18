import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { MonthlyTotal } from '../../models/trade';

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

interface MonthRow {
  month: number;
  monthNumber: string;
  name: string;
  total: MonthlyTotal | undefined;
  isCurrent: boolean;
  monthKey: string;
}

@Component({
  selector: 'app-calendar-yearly-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  host: {
    class: 'block w-full',
  },
  styles: `
    :host .current-month-row {
      border-top: 1px solid #258cf4 !important;
      border-bottom: 1px solid #258cf4 !important;
      position: relative;
      z-index: 10;
      margin-top: -1px;
      margin-bottom: -1px;
    }
  `,
  template: `
    <div
      class="w-full border border-cool-grey rounded-xl overflow-hidden shadow-2xl shadow-black/20 bg-background-dark"
      role="grid"
      aria-label="Yearly trading overview"
    >
      <div
        class="grid items-center border-b border-cool-grey bg-cool-grey/30"
        style="grid-template-columns: 4px 1fr 2fr 2fr 48px"
        role="row"
      >
        <div role="columnheader"></div>
        <div
          role="columnheader"
          class="py-4 px-6 text-[10px] text-slate-500 tracking-[0.2em] uppercase"
        >
          Month
        </div>
        <div
          role="columnheader"
          class="py-4 px-6 text-[10px] text-slate-500 tracking-[0.2em] uppercase text-right"
        >
          Trades
        </div>
        <div
          role="columnheader"
          class="py-4 px-6 text-[10px] text-slate-500 tracking-[0.2em] uppercase text-right"
        >
          Net P/L
        </div>
        <div role="columnheader"></div>
      </div>
      @for (row of rows(); track row.month; let last = $last) {
        <div
          role="row"
          class="grid items-center cursor-pointer hover:bg-white/[0.05] transition-colors"
          [class.current-month-row]="row.isCurrent"
          [class.bg-white/[0.02]]="row.isCurrent"
          style="grid-template-columns: 4px 1fr 2fr 2fr 48px"
          [style.border-bottom]="last ? 'none' : '1px solid #2A3038'"
          tabindex="0"
          [attr.aria-label]="rowAriaLabel(row)"
          (click)="monthSelected.emit({ year: year(), month: row.month })"
          (keydown.enter)="monthSelected.emit({ year: year(), month: row.month })"
          (keydown.space)="onRowSpace($event, row)"
        >
          <div class="h-12" [class]="indicatorClass(row)"></div>
          <div class="px-6 py-4 flex items-center gap-4">
            <span class="text-sm" [class]="row.isCurrent ? 'text-primary' : 'text-slate-500'">{{
              row.monthNumber
            }}</span>
            <span class="uppercase tracking-widest text-xs text-white">{{ row.name }}</span>
          </div>
          <div class="px-6 py-4 text-right">
            @if (row.total) {
              <span class="text-slate-400 text-sm">
                {{ row.total.tradeCount }} {{ row.total.tradeCount === 1 ? 'TRADE' : 'TRADES' }}
              </span>
            } @else {
              <span class="text-slate-400 text-sm">0 TRADES</span>
            }
          </div>
          <div class="px-6 py-4 text-right">
            @if (row.total && row.total.netPL !== 0) {
              <span class="text-lg" [class]="row.total.netPL >= 0 ? 'text-success' : 'text-danger'">
                {{ row.total.netPL >= 0 ? '+' : ''
                }}{{ row.total.netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
              </span>
            } @else {
              <span class="text-slate-300 text-lg">
                {{ 0 | currency: currency() : 'symbol-narrow' : '1.2-2' }}
              </span>
            }
          </div>
          <div class="px-6 py-4 flex justify-center text-slate-500" aria-hidden="true">
            <img
              style="width:14px;height:14px;max-width:none"
              alt=""
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E"
            />
          </div>
        </div>
      }
    </div>
  `,
})
export class CalendarYearlyGrid {
  readonly year = input.required<number>();
  readonly currency = input('EUR');
  readonly monthlyTotals = input.required<Record<string, MonthlyTotal>>();
  readonly monthSelected = output<{ year: number; month: number }>();

  protected readonly rows = computed<MonthRow[]>(() => {
    const year = this.year();
    const totals = this.monthlyTotals();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return MONTH_NAMES.map((name, i) => {
      const month = i + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      return {
        month,
        monthNumber: String(month).padStart(2, '0'),
        name,
        total: totals[monthKey],
        isCurrent: year === currentYear && month === currentMonth,
        monthKey,
      };
    });
  });

  protected indicatorClass(row: MonthRow): string {
    if (!row.total || row.total.netPL === 0) return 'bg-slate-700';
    return row.total.netPL > 0 ? 'bg-success' : 'bg-danger';
  }

  protected rowAriaLabel(row: MonthRow): string {
    if (!row.total) return `${row.name}: no trades. Click to view month`;
    const dir = row.total.netPL >= 0 ? 'profit' : 'loss';
    return `${row.name}: ${dir} ${Math.abs(row.total.netPL)}, ${row.total.tradeCount} trades. Click to view month`;
  }

  protected onRowSpace(event: Event, row: MonthRow) {
    event.preventDefault();
    this.monthSelected.emit({ year: this.year(), month: row.month });
  }
}
