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
      <span class="text-xs text-gray-500">{{ day() }}</span>
      @if (summary()) {
        <span class="font-semibold text-sm" [class]="plClass()">
          {{ plPrefix() }}{{ summary()!.netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
        </span>
        <span class="mt-auto inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
          {{ summary()!.tradeCount }} {{ summary()!.tradeCount === 1 ? 'trade' : 'trades' }}
        </span>
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

  protected readonly plClass = computed(() => {
    const s = this.summary();
    if (!s) return '';
    return s.netPL >= 0 ? 'text-green-700' : 'text-red-700';
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
    const base = 'flex flex-col gap-0.5 rounded-lg border p-2 min-h-[80px] text-xs sm:text-sm';
    const weekend = this.isWeekend() ? ' bg-gray-50' : ' bg-white';
    const today = this.isToday() ? ' ring-2 ring-blue-500' : '';
    const empty = !this.day() ? ' border-transparent' : ' border-gray-200';
    const clickable = this.isClickable() ? ' hover:shadow-md hover:border-blue-300 transition-shadow' : '';
    return base + weekend + today + empty + clickable;
  });
}
