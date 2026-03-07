import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarDayCell } from './calendar-day-cell';
import type { DailySummary } from '../models/trade';

describe('CalendarDayCell', () => {
  let fixture: ComponentFixture<CalendarDayCell>;
  let component: CalendarDayCell;

  const positiveSummary: DailySummary = {
    date: '2024-01-15',
    tradeCount: 3,
    netPL: 150.5,
    trades: [
      { symbol: 'EURUSD', type: 'buy', volume: 0.1, commission: -1, swap: 0, profit: 151.5, netPL: 150.5 },
    ],
  };

  const negativeSummary: DailySummary = {
    date: '2024-01-16',
    tradeCount: 1,
    netPL: -30,
    trades: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalendarDayCell] });
    fixture = TestBed.createComponent(CalendarDayCell);
    component = fixture.componentInstance;
  });

  it('plClass returns text-green-700 for positive netPL', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('text-green-700');
  });

  it('plClass returns text-red-700 for negative netPL', () => {
    fixture.componentRef.setInput('day', 16);
    fixture.componentRef.setInput('summary', negativeSummary);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('text-red-700');
  });

  it('plClass returns empty string when no summary', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('');
  });

  it('plPrefix returns + for positive netPL', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['plPrefix']()).toBe('+');
  });

  it('plPrefix returns empty string for negative netPL', () => {
    fixture.componentRef.setInput('day', 16);
    fixture.componentRef.setInput('summary', negativeSummary);
    fixture.detectChanges();
    expect(component['plPrefix']()).toBe('');
  });

  it('plPrefix returns empty string when no summary', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['plPrefix']()).toBe('');
  });

  it('ariaLabel returns Day N when no summary', () => {
    fixture.componentRef.setInput('day', 5);
    fixture.detectChanges();
    expect(component['ariaLabel']()).toBe('Day 5');
  });

  it('ariaLabel includes profit direction and click hint when summary present', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['ariaLabel']()).toBe('Day 15: profit 150.5 EUR, 3 trades. Click to view trades');
  });

  it('ariaLabel includes loss direction for negative netPL', () => {
    fixture.componentRef.setInput('day', 16);
    fixture.componentRef.setInput('summary', negativeSummary);
    fixture.detectChanges();
    expect(component['ariaLabel']()).toBe('Day 16: loss 30 EUR, 1 trades. Click to view trades');
  });

  it('hostClasses includes bg-gray-50 when isWeekend is true', () => {
    fixture.componentRef.setInput('day', 6);
    fixture.componentRef.setInput('isWeekend', true);
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('bg-gray-50');
    expect(component['hostClasses']()).not.toContain('bg-white');
  });

  it('hostClasses includes ring class when isToday is true', () => {
    fixture.componentRef.setInput('day', 7);
    fixture.componentRef.setInput('isToday', true);
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('ring-2 ring-blue-500');
  });

  it('hostClasses includes border-transparent when no day', () => {
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('border-transparent');
  });

  it('hostClasses includes border-gray-200 when day is set', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('border-gray-200');
  });

  it('dayClick emits summary when cell with trades is clicked', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    const spy = vi.fn();
    component.dayClick.subscribe(spy);
    fixture.nativeElement.click();
    expect(spy).toHaveBeenCalledWith(positiveSummary);
  });

  it('dayClick does NOT emit when cell has no summary', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    const spy = vi.fn();
    component.dayClick.subscribe(spy);
    fixture.nativeElement.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('clickable cells have tabindex 0, non-clickable have -1', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');

    fixture.componentRef.setInput('summary', undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('-1');
  });

  it('clickable cells include hover classes in hostClasses', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('hover:shadow-md');
    expect(component['hostClasses']()).toContain('hover:border-blue-300');
  });

  it('non-clickable cells do not include hover classes', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['hostClasses']()).not.toContain('hover:shadow-md');
  });
});
