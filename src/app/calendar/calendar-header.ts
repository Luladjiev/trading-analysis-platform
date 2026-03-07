import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { MonthlyTotal } from '../models/trade';

@Component({
  selector: 'app-calendar-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <div class="flex flex-col gap-2">
      <h1 class="text-white text-5xl font-light leading-none tracking-tighter" aria-live="polite">
        {{ monthLabel() }} {{ year() }}
      </h1>
      @if (monthlyTotal()) {
        <div class="flex items-center gap-2">
          <span
            class="text-xl font-medium tracking-tight"
            [class]="monthlyTotal()!.netPL >= 0 ? 'text-success' : 'text-danger'"
          >
            {{ monthlyTotal()!.netPL >= 0 ? '+' : '' }}{{ monthlyTotal()!.netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
          </span>
          <span class="text-slate-500 text-sm font-medium uppercase tracking-widest">
            ({{ monthlyTotal()!.tradeCount }} {{ monthlyTotal()!.tradeCount === 1 ? 'trade' : 'trades' }})
          </span>
        </div>
      }
    </div>
  `,
})
export class CalendarHeader {
  readonly monthLabel = input.required<string>();
  readonly year = input.required<number>();
  readonly monthlyTotal = input<MonthlyTotal | undefined>(undefined);
  readonly currency = input('EUR');
}
