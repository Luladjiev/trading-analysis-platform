import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
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
    <div class="w-full min-w-[1024px] border border-cool-grey overflow-hidden shadow-lg shadow-black/20" role="grid" aria-label="Trading calendar">
      <div class="grid grid-cols-7 bg-cool-grey/30 border-b border-cool-grey" role="row">
        @for (header of weekdays; track header) {
          <div role="columnheader" class="py-4 text-center text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
            {{ header }}
          </div>
        }
      </div>
      <div class="grid grid-cols-7 gap-px bg-cool-grey">
        @for (week of weeks(); track $index) {
          <div role="row" class="contents">
            @for (slot of week; track $index) {
              <app-calendar-day-cell
                [day]="slot.day"
                [summary]="slot.dateKey ? dailySummaries()[slot.dateKey] : undefined"
                [currency]="currency()"
                [isToday]="slot.isToday"
                [isWeekend]="slot.isWeekend"
                (dayClick)="daySelected.emit($event)"
              />
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class CalendarGrid {
  readonly weeks = input.required<CalendarDaySlot[][]>();
  readonly dailySummaries = input.required<Record<string, DailySummary>>();
  readonly currency = input('EUR');
  readonly daySelected = output<DailySummary>();

  protected readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}
