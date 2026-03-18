import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import type { DailySummary } from '../../models/trade';
import { CalendarDayCell } from '../calendar-day-cell/calendar-day-cell';
import { CalendarWeeklyCell } from '../calendar-weekly-cell/calendar-weekly-cell';

export interface CalendarDaySlot {
  day: number | null;
  dateKey: string | null;
  isToday: boolean;
  isWeekend: boolean;
}

export interface WeeklyPnL {
  netPL: number;
  tradeCount: number;
}

@Component({
  selector: 'app-calendar-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarDayCell, CalendarWeeklyCell],
  templateUrl: './calendar-grid.html',
})
export class CalendarGrid {
  readonly weeks = input.required<CalendarDaySlot[][]>();
  readonly dailySummaries = input.required<Record<string, DailySummary>>();
  readonly currency = input('EUR');
  readonly daySelected = output<DailySummary>();

  protected readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  protected readonly weeklyPnLs = computed<WeeklyPnL[]>(() => {
    const summaries = this.dailySummaries();
    return this.weeks().map((week) => {
      let netPL = 0;
      let tradeCount = 0;
      for (const slot of week) {
        if (slot.dateKey && summaries[slot.dateKey]) {
          netPL += summaries[slot.dateKey].netPL;
          tradeCount += summaries[slot.dateKey].tradeCount;
        }
      }
      return { netPL, tradeCount };
    });
  });
}
