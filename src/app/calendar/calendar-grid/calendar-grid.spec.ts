import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarGrid, type CalendarDaySlot } from './calendar-grid';
import type { DailySummary } from '../../models/trade';

describe('CalendarGrid', () => {
  let fixture: ComponentFixture<CalendarGrid>;

  const makeSlot = (day: number | null): CalendarDaySlot => ({
    day,
    dateKey: day ? `2024-01-${String(day).padStart(2, '0')}` : null,
    isToday: false,
    isWeekend: false,
  });

  const twoWeeks: CalendarDaySlot[][] = [
    [makeSlot(1), makeSlot(2), makeSlot(3), makeSlot(4), makeSlot(5), makeSlot(6), makeSlot(7)],
    [
      makeSlot(8),
      makeSlot(9),
      makeSlot(10),
      makeSlot(11),
      makeSlot(12),
      makeSlot(13),
      makeSlot(14),
    ],
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalendarGrid] });
    fixture = TestBed.createComponent(CalendarGrid);
  });

  it('renders 8 column headers with Weekly as the 8th', () => {
    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', {});
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('[role="columnheader"]');
    expect(headers.length).toBe(8);

    const labels = Array.from(headers).map((el) => (el as HTMLElement).textContent!.trim());
    expect(labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Weekly']);
  });

  it('renders correct number of day cells based on weeks input', () => {
    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', {});
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('app-calendar-day-cell');
    expect(cells.length).toBe(14);
  });

  it('renders a weekly cell for each week row', () => {
    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', {});
    fixture.detectChanges();

    const weeklyCells = fixture.nativeElement.querySelectorAll('app-calendar-weekly-cell');
    expect(weeklyCells.length).toBe(2);
  });

  it('computes weekly PnL by summing daily summaries', () => {
    const makeSummary = (date: string, netPL: number, tradeCount: number): DailySummary => ({
      date,
      netPL,
      tradeCount,
      trades: [],
    });

    const summaries: Record<string, DailySummary> = {
      '2024-01-01': makeSummary('2024-01-01', 100, 2),
      '2024-01-03': makeSummary('2024-01-03', -30, 1),
      '2024-01-08': makeSummary('2024-01-08', 50, 3),
    };

    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', summaries);
    fixture.detectChanges();

    const weeklyCells = fixture.nativeElement.querySelectorAll('app-calendar-weekly-cell');

    // Week 1: 100 + (-30) = 70
    expect(weeklyCells[0].textContent).toContain('€70.00');

    // Week 2: 50
    expect(weeklyCells[1].textContent).toContain('€50.00');
  });

  it('daySelected relays dayClick from child cell', () => {
    const summary: DailySummary = {
      date: '2024-01-01',
      tradeCount: 1,
      netPL: 50,
      trades: [
        {
          symbol: 'EURUSD',
          type: 'buy',
          volume: 0.1,
          commission: -1,
          swap: 0,
          profit: 51,
          netPL: 50,
        },
      ],
    };
    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', { '2024-01-01': summary });
    fixture.detectChanges();

    const spy = vi.fn();
    fixture.componentInstance.daySelected.subscribe(spy);

    const firstCell = fixture.nativeElement.querySelector('app-calendar-day-cell');
    firstCell.click();
    expect(spy).toHaveBeenCalledWith(summary);
  });
});
