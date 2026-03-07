import { Component, ChangeDetectionStrategy, input, computed, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { DailySummary } from '../models/trade';

@Component({
  selector: 'app-calendar-day-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  host: {
    'role': 'gridcell',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'hostClasses()',
    '[attr.tabindex]': 'isClickable() ? 0 : -1',
    '[style.cursor]': 'isClickable() ? "pointer" : "default"',
    '(click)': 'onCellClick()',
    '(keydown.enter)': 'onCellClick()',
    '(keydown.space)': 'onCellClick($event)',
  },
  template: `
    @if (day()) {
      <div class="flex justify-between items-start">
        <span [class]="dayNumberClass()">{{ dayDisplay() }}</span>
        @if (summary()) {
          <span class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
            {{ summary()!.tradeCount }} {{ summary()!.tradeCount === 1 ? 'TRADE' : 'TRADES' }}
          </span>
        }
      </div>
      @if (summary()) {
        <div class="mt-auto flex flex-col">
          <span class="text-lg" [class]="plClass()">
            {{ plPrefix() }}{{ summary()!.netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
          </span>
          <div class="w-full h-0.5 mt-1" [class]="barClass()"></div>
        </div>
      }
    }
  `,
})
export class CalendarDayCell {
  readonly day = input<number | null>(null);
  readonly summary = input<DailySummary | undefined>(undefined);
  readonly currency = input('EUR');
  readonly isToday = input(false);
  readonly isWeekend = input(false);
  readonly dayClick = output<DailySummary>();

  readonly isClickable = computed(() => !!this.summary());

  protected onCellClick(event?: Event) {
    event?.preventDefault();
    const s = this.summary();
    if (s) this.dayClick.emit(s);
  }

  protected readonly dayDisplay = computed(() => {
    const d = this.day();
    if (!d) return '';
    return String(d).padStart(2, '0');
  });

  protected readonly dayNumberClass = computed(() => {
    if (this.isToday()) return 'text-xs font-bold text-primary';
    if (this.summary()) return 'text-xs font-medium text-slate-100';
    return 'text-xs font-medium text-slate-500';
  });

  protected readonly plClass = computed(() => {
    const s = this.summary();
    if (!s) return '';
    const color = s.netPL >= 0 ? 'text-success' : 'text-danger';
    return this.isToday() ? `${color} font-bold` : `${color} font-medium`;
  });

  protected readonly barClass = computed(() => {
    const s = this.summary();
    if (!s) return '';
    if (this.isToday()) return s.netPL >= 0 ? 'bg-success' : 'bg-danger';
    return s.netPL >= 0 ? 'bg-success/30' : 'bg-danger/30';
  });

  protected readonly plPrefix = computed(() => {
    const s = this.summary();
    if (!s) return '';
    return s.netPL >= 0 ? '+' : '';
  });

  protected readonly ariaLabel = computed(() => {
    const d = this.day();
    if (!d) return undefined;
    const s = this.summary();
    if (!s) return `Day ${d}`;
    const dir = s.netPL >= 0 ? 'profit' : 'loss';
    return `Day ${d}: ${dir} ${Math.abs(s.netPL)} ${this.currency()}, ${s.tradeCount} trades. Click to view trades`;
  });

  protected readonly hostClasses = computed(() => {
    const base = 'h-[100px] p-2 flex flex-col transition-colors';

    if (!this.day()) {
      return `${base} bg-background-dark opacity-20`;
    }

    if (this.isToday()) {
      return `${base} bg-white/[0.04] border border-primary/60 relative z-10`;
    }

    return `${base} bg-background-dark hover:bg-white/[0.03]`;
  });
}
