import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarHeader } from './calendar-header';
import type { MonthlyTotal } from '../../models/trade';

describe('CalendarHeader', () => {
  let fixture: ComponentFixture<CalendarHeader>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalendarHeader] });
    fixture = TestBed.createComponent(CalendarHeader);
  });

  it('displays month label and year', () => {
    fixture.componentRef.setInput('monthLabel', 'January');
    fixture.componentRef.setInput('year', 2024);
    fixture.detectChanges();

    const h1: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('January');
    expect(h1.textContent).toContain('2024');
  });

  it('displays monthly total with correct sign and color for positive', () => {
    const total: MonthlyTotal = { netPL: 120.5, tradeCount: 4 };
    fixture.componentRef.setInput('monthLabel', 'January');
    fixture.componentRef.setInput('year', 2024);
    fixture.componentRef.setInput('monthlyTotal', total);
    fixture.detectChanges();

    const plSpan: HTMLElement = fixture.nativeElement.querySelector('.text-success, .text-danger');
    expect(plSpan.textContent).toContain('+');
    expect(plSpan.className).toContain('text-success');

    const countSpan: HTMLElement = fixture.nativeElement.querySelector('.text-slate-500');
    expect(countSpan.textContent).toContain('4 trades');
  });

  it('displays monthly total with danger color for negative', () => {
    const total: MonthlyTotal = { netPL: -50, tradeCount: 2 };
    fixture.componentRef.setInput('monthLabel', 'February');
    fixture.componentRef.setInput('year', 2024);
    fixture.componentRef.setInput('monthlyTotal', total);
    fixture.detectChanges();

    const plSpan: HTMLElement = fixture.nativeElement.querySelector('.text-success, .text-danger');
    expect(plSpan.className).toContain('text-danger');
  });
});
