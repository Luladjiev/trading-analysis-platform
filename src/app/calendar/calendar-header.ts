import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { MonthlyTotal } from '../models/trade';

@Component({
  selector: 'app-calendar-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  template: `
    <div class="flex items-center justify-between py-4">
      <button
        (click)="previousMonth.emit()"
        aria-label="Previous month"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        &larr; Prev
      </button>

      <div class="text-center">
        <h1 class="text-xl font-semibold" aria-live="polite">{{ monthLabel() }} {{ year() }}</h1>
        @if (monthlyTotal()) {
          <p
            class="text-sm font-medium mt-0.5"
            [class]="monthlyTotal()!.netPL >= 0 ? 'text-green-700' : 'text-red-700'"
          >
            {{ monthlyTotal()!.netPL >= 0 ? '+' : '' }}{{ monthlyTotal()!.netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
            ({{ monthlyTotal()!.tradeCount }} trades)
          </p>
        }
      </div>

      <button
        (click)="nextMonth.emit()"
        aria-label="Next month"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Next &rarr;
      </button>
    </div>
  `,
})
export class CalendarHeader {
  readonly monthLabel = input.required<string>();
  readonly year = input.required<number>();
  readonly monthlyTotal = input<MonthlyTotal | undefined>(undefined);
  readonly currency = input('EUR');

  readonly previousMonth = output();
  readonly nextMonth = output();
}
