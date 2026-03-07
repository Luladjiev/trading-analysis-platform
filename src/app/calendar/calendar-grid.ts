import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import type { DailySummary } from '../models/trade';
import { CalendarDayCell } from './calendar-day-cell';

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
  template: `
    <div class="grid grid-cols-7 gap-1" role="grid" aria-label="Trading calendar">
      <div role="row" class="contents">
        @for (header of weekdays; track header) {
          <div role="columnheader" class="py-2 text-center text-xs font-medium text-gray-500 uppercase">
            {{ header }}
          </div>
        }
      </div>
      @for (week of weeks(); track $index) {
        <div role="row" class="contents">
          @for (slot of week; track $index) {
            <app-calendar-day-cell
              [day]="slot.day"
              [summary]="slot.dateKey ? dailySummaries()[slot.dateKey] : undefined"
              [currency]="currency()"
              [isToday]="slot.isToday"
              [isWeekend]="slot.isWeekend"
            />
          }
        </div>
      }
    </div>
  `,
})
export class CalendarGrid {
  readonly weeks = input.required<CalendarDaySlot[][]>();
  readonly dailySummaries = input.required<Record<string, DailySummary>>();
  readonly currency = input('EUR');

  protected readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}
