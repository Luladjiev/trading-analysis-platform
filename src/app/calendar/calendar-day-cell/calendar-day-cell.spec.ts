import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarDayCell } from './calendar-day-cell';
import type { DailySummary } from '../../models/trade';

describe('CalendarDayCell', () => {
  let fixture: ComponentFixture<CalendarDayCell>;
  let component: CalendarDayCell;

  const positiveSummary: DailySummary = {
    date: '2024-01-15',
    tradeCount: 3,
    netPL: 150.5,
    trades: [
      {
        symbol: 'EURUSD',
        type: 'buy',
        volume: 0.1,
        commission: -1,
        swap: 0,
        profit: 151.5,
        netPL: 150.5,
      },
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

  it('plClass returns text-success for positive netPL', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('text-success');
  });

  it('plClass returns text-danger for negative netPL', () => {
    fixture.componentRef.setInput('day', 16);
    fixture.componentRef.setInput('summary', negativeSummary);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('text-danger');
  });

  it('plClass returns empty string when no summary', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('');
  });

  it('plClass returns text-success for today', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.componentRef.setInput('isToday', true);
    fixture.detectChanges();
    expect(component['plClass']()).toBe('text-success');
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

  it('dayDisplay zero-pads single digit days', () => {
    fixture.componentRef.setInput('day', 5);
    fixture.detectChanges();
    expect(component['dayDisplay']()).toBe('05');
  });

  it('dayDisplay does not pad double digit days', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.detectChanges();
    expect(component['dayDisplay']()).toBe('15');
  });

  it('dayNumberClass returns text-primary for today', () => {
    fixture.componentRef.setInput('day', 7);
    fixture.componentRef.setInput('isToday', true);
    fixture.detectChanges();
    expect(component['dayNumberClass']()).toContain('text-primary');
  });

  it('dayNumberClass returns text-slate-100 when summary present', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['dayNumberClass']()).toContain('text-slate-100');
  });

  it('dayNumberClass returns text-slate-500 when no summary', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['dayNumberClass']()).toContain('text-slate-500');
  });

  it('barClass returns bg-success for today with positive P/L', () => {
    fixture.componentRef.setInput('day', 7);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.componentRef.setInput('isToday', true);
    fixture.detectChanges();
    expect(component['barClass']()).toBe('bg-success');
  });

  it('barClass returns bg-success/30 for non-today positive P/L', () => {
    fixture.componentRef.setInput('day', 15);
    fixture.componentRef.setInput('summary', positiveSummary);
    fixture.detectChanges();
    expect(component['barClass']()).toBe('bg-success/30');
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
    expect(component['ariaLabel']()).toBe(
      'Day 15: profit 150.5 EUR, 3 trades. Click to view trades',
    );
  });

  it('ariaLabel includes loss direction for negative netPL', () => {
    fixture.componentRef.setInput('day', 16);
    fixture.componentRef.setInput('summary', negativeSummary);
    fixture.detectChanges();
    expect(component['ariaLabel']()).toBe('Day 16: loss 30 EUR, 1 trades. Click to view trades');
  });

  it('hostClasses includes opacity-20 when no day', () => {
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('opacity-20');
    expect(component['hostClasses']()).toContain('bg-background-dark');
  });

  it('hostClasses includes border-primary for today', () => {
    fixture.componentRef.setInput('day', 7);
    fixture.componentRef.setInput('isToday', true);
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('border border-primary/60');
    expect(component['hostClasses']()).toContain('bg-white/[0.04]');
  });

  it('hostClasses includes bg-background-dark for regular day', () => {
    fixture.componentRef.setInput('day', 1);
    fixture.detectChanges();
    expect(component['hostClasses']()).toContain('bg-background-dark');
    expect(component['hostClasses']()).toContain('hover:bg-white/[0.03]');
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
});
