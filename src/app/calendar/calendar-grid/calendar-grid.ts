import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import type { DailySummary } from '../../models/trade';
import { CalendarDayCell } from '../calendar-day-cell/calendar-day-cell';

export interface CalendarDaySlot {
  day: number | null;
  dateKey: string | null;
  isToday: boolean;
  isWeekend: boolean;
}

@Component({
  selector: 'app-calendar-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarDayCell],
  templateUrl: './calendar-grid.html',
})
export class CalendarGrid {
  readonly weeks = input.required<CalendarDaySlot[][]>();
  readonly dailySummaries = input.required<Record<string, DailySummary>>();
  readonly currency = input('EUR');
  readonly daySelected = output<DailySummary>();

  protected readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}
