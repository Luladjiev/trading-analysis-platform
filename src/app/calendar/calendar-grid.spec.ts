import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarGrid, type CalendarDaySlot } from './calendar-grid';

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
    [makeSlot(8), makeSlot(9), makeSlot(10), makeSlot(11), makeSlot(12), makeSlot(13), makeSlot(14)],
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalendarGrid] });
    fixture = TestBed.createComponent(CalendarGrid);
  });

  it('renders 7 weekday column headers', () => {
    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', {});
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('[role="columnheader"]');
    expect(headers.length).toBe(7);

    const labels = Array.from(headers).map((el: any) => el.textContent.trim());
    expect(labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('renders correct number of day cells based on weeks input', () => {
    fixture.componentRef.setInput('weeks', twoWeeks);
    fixture.componentRef.setInput('dailySummaries', {});
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('app-calendar-day-cell');
    expect(cells.length).toBe(14);
  });
});
