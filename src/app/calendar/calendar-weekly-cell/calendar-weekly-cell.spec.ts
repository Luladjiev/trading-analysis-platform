import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CalendarWeeklyCell } from './calendar-weekly-cell';

describe('CalendarWeeklyCell', () => {
  let fixture: ComponentFixture<CalendarWeeklyCell>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CalendarWeeklyCell] });
    fixture = TestBed.createComponent(CalendarWeeklyCell);
  });

  it('applies success text styling for positive PnL', () => {
    fixture.componentRef.setInput('netPL', 150);
    fixture.componentRef.setInput('tradeCount', 5);
    fixture.detectChanges();

    const plSpan = fixture.nativeElement.querySelector('.text-success');
    expect(plSpan).toBeTruthy();
  });

  it('applies danger text styling for negative PnL', () => {
    fixture.componentRef.setInput('netPL', -80);
    fixture.componentRef.setInput('tradeCount', 3);
    fixture.detectChanges();

    const plSpan = fixture.nativeElement.querySelector('.text-danger');
    expect(plSpan).toBeTruthy();
  });

  it('shows nothing when no trades', () => {
    fixture.componentRef.setInput('netPL', 0);
    fixture.componentRef.setInput('tradeCount', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent!.trim()).toBe('');
  });

  it('uses consistent gray background regardless of PnL', () => {
    fixture.componentRef.setInput('netPL', 150);
    fixture.componentRef.setInput('tradeCount', 5);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.className).toContain('bg-background-dark');
    expect(host.className).not.toContain('bg-success');
    expect(host.className).not.toContain('bg-danger');
  });

  it('displays formatted PnL without trade count', () => {
    fixture.componentRef.setInput('netPL', 250);
    fixture.componentRef.setInput('tradeCount', 7);
    fixture.componentRef.setInput('currency', 'USD');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent!;
    expect(text).toContain('PnL');
    expect(text).toContain('$250.00');
    expect(text).not.toContain('trades');
  });

  it('sets aria-label with weekly total info', () => {
    fixture.componentRef.setInput('netPL', -50);
    fixture.componentRef.setInput('tradeCount', 2);
    fixture.componentRef.setInput('currency', 'EUR');
    fixture.detectChanges();

    const label = fixture.nativeElement.getAttribute('aria-label');
    expect(label).toBe('Weekly total: loss 50 EUR, 2 trades');
  });
});
