import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarHeader } from './calendar-header';
import type { MonthlyTotal } from '../models/trade';

describe('CalendarHeader', () => {
  let fixture: ComponentFixture<CalendarHeader>;
  let component: CalendarHeader;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalendarHeader] });
    fixture = TestBed.createComponent(CalendarHeader);
    component = fixture.componentInstance;
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

    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.textContent).toContain('+');
    expect(p.textContent).toContain('4 trades');
    expect(p.className).toContain('text-green-700');
  });

  it('displays monthly total with red color for negative', () => {
    const total: MonthlyTotal = { netPL: -50, tradeCount: 2 };
    fixture.componentRef.setInput('monthLabel', 'February');
    fixture.componentRef.setInput('year', 2024);
    fixture.componentRef.setInput('monthlyTotal', total);
    fixture.detectChanges();

    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.className).toContain('text-red-700');
  });

  it('emits previousMonth when prev button clicked', () => {
    fixture.componentRef.setInput('monthLabel', 'January');
    fixture.componentRef.setInput('year', 2024);
    fixture.detectChanges();

    const spy = vi.fn();
    component.previousMonth.subscribe(spy);

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Previous month"]');
    btn.click();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('emits nextMonth when next button clicked', () => {
    fixture.componentRef.setInput('monthLabel', 'January');
    fixture.componentRef.setInput('year', 2024);
    fixture.detectChanges();

    const spy = vi.fn();
    component.nextMonth.subscribe(spy);

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Next month"]');
    btn.click();

    expect(spy).toHaveBeenCalledOnce();
  });
});
