import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { MonthlyTotal } from '../../models/trade';

@Component({
  selector: 'app-calendar-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './calendar-header.html',
})
export class CalendarHeader {
  readonly monthLabel = input.required<string>();
  readonly year = input.required<number>();
  readonly monthlyTotal = input<MonthlyTotal | undefined>(undefined);
  readonly currency = input('EUR');
}
