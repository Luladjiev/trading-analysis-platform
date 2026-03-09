import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CalendarPage } from './calendar-page';
import { TradeDataService } from '../../services/trade-data/trade-data.service';

const mockService = {
  account: { name: 'Test', number: '123', currency: 'USD', company: 'TestCo' },
  getAvailableMonths: () => ['2024-01', '2024-02', '2024-12'],
  getMonthlyTotal: (key: string) => {
    const totals: Record<string, { netPL: number; tradeCount: number }> = {
      '2024-01': { netPL: 100, tradeCount: 5 },
      '2024-02': { netPL: -50, tradeCount: 3 },
      '2024-12': { netPL: 200, tradeCount: 8 },
    };
    return totals[key];
  },
  getDailySummariesForMonth: () => ({}),
};

describe('CalendarPage', () => {
  let component: CalendarPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarPage],
      providers: [{ provide: TradeDataService, useValue: mockService }],
    });
    const fixture = TestBed.createComponent(CalendarPage);
    component = fixture.componentInstance;
  });

  it('initializes to last available month from service', () => {
    expect(component.currentYear()).toBe(2024);
    expect(component.currentMonth()).toBe(12);
  });

  it('navigateMonth(1) increments month', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(3);
    component.navigateMonth(1);
    expect(component.currentMonth()).toBe(4);
    expect(component.currentYear()).toBe(2024);
  });

  it('navigateMonth(1) wraps Dec to Jan with year increment', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(12);
    component.navigateMonth(1);
    expect(component.currentMonth()).toBe(1);
    expect(component.currentYear()).toBe(2025);
  });

  it('navigateMonth(-1) decrements month', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(5);
    component.navigateMonth(-1);
    expect(component.currentMonth()).toBe(4);
    expect(component.currentYear()).toBe(2024);
  });

  it('navigateMonth(-1) wraps Jan to Dec with year decrement', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(1);
    component.navigateMonth(-1);
    expect(component.currentMonth()).toBe(12);
    expect(component.currentYear()).toBe(2023);
  });

  it('monthLabel returns correct month name', () => {
    component.currentMonth.set(1);
    expect(component['monthLabel']()).toBe('January');
    component.currentMonth.set(12);
    expect(component['monthLabel']()).toBe('December');
  });

  it('previousMonthLabel returns previous month name and year', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(3);
    expect(component['previousMonthLabel']()).toBe('February 2024');
  });

  it('previousMonthLabel wraps January to December of previous year', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(1);
    expect(component['previousMonthLabel']()).toBe('December 2023');
  });

  it('previousMonthSummaries calls service with previous month', () => {
    const spy = vi.spyOn(mockService, 'getDailySummariesForMonth');
    component.currentYear.set(2024);
    component.currentMonth.set(3);
    component['previousMonthSummaries']();
    expect(spy).toHaveBeenCalledWith(2024, 2);
  });

  it('previousMonthSummaries wraps Jan to Dec of previous year', () => {
    const spy = vi.spyOn(mockService, 'getDailySummariesForMonth');
    component.currentYear.set(2024);
    component.currentMonth.set(1);
    component['previousMonthSummaries']();
    expect(spy).toHaveBeenCalledWith(2023, 12);
  });

  it('calendarWeeks generates correct grid structure for Feb 2024', () => {
    component.currentYear.set(2024);
    component.currentMonth.set(2); // Feb 2024 starts on Thursday (dow 3)
    const weeks = component['calendarWeeks']();

    // Feb 2024: 29 days, starts Thu -> 3 leading empties
    expect(weeks[0][0].day).toBeNull(); // Mon
    expect(weeks[0][1].day).toBeNull(); // Tue
    expect(weeks[0][2].day).toBeNull(); // Wed
    expect(weeks[0][3].day).toBe(1);    // Thu

    // Total day slots across all weeks
    const allSlots = weeks.flat();
    expect(allSlots.length % 7).toBe(0); // always full weeks
    const daySlots = allSlots.filter(s => s.day !== null);
    expect(daySlots.length).toBe(29);

    // Last day
    const lastDay = daySlots[daySlots.length - 1];
    expect(lastDay.day).toBe(29);
    expect(lastDay.dateKey).toBe('2024-02-29');
  });
});
