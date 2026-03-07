import { TestBed } from '@angular/core/testing';
import { Component, viewChild } from '@angular/core';
import { PnlChart } from './pnl-chart';
import type { DailySummary } from '../models/trade';
import { vi } from 'vitest';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

const mockSeries = {
  setData: vi.fn(),
};

const mockChart = {
  addSeries: vi.fn(() => mockSeries),
  timeScale: vi.fn(() => ({ fitContent: vi.fn() })),
  applyOptions: vi.fn(),
  remove: vi.fn(),
};

vi.mock('lightweight-charts', () => ({
  createChart: vi.fn(() => mockChart),
  BaselineSeries: {},
}));

function makeSummary(date: string, netPL: number): DailySummary {
  return { date, netPL, tradeCount: 1, trades: [] };
}

@Component({
  imports: [PnlChart],
  template: `<app-pnl-chart [dailySummaries]="summaries" [currency]="currency" />`,
})
class TestHost {
  summaries: Record<string, DailySummary> = {};
  currency = 'USD';
  readonly chart = viewChild.required(PnlChart);
}

describe('PnlChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TestHost],
    });
  });

  it('should create component', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.chart()).toBeTruthy();
  });

  it('chartData transforms and sorts dailySummaries', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.summaries = {
      '2024-03-15': makeSummary('2024-03-15', 50),
      '2024-03-01': makeSummary('2024-03-01', -20),
      '2024-03-10': makeSummary('2024-03-10', 30),
    };
    fixture.detectChanges();

    const chart = fixture.componentInstance.chart();
    const data = chart['chartData']();

    expect(data).toEqual([
      { time: '2024-03-01', value: -20 },
      { time: '2024-03-10', value: 10 },
      { time: '2024-03-15', value: 60 },
    ]);
  });

  it('chartData handles empty summaries', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.summaries = {};
    fixture.detectChanges();

    const chart = fixture.componentInstance.chart();
    const data = chart['chartData']();

    expect(data).toEqual([]);
  });

  it('ariaLabel describes data when present', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.summaries = {
      '2024-03-01': makeSummary('2024-03-01', 100),
      '2024-03-02': makeSummary('2024-03-02', -30),
    };
    fixture.componentInstance.currency = 'EUR';
    fixture.detectChanges();

    const chart = fixture.componentInstance.chart();
    const label = chart['ariaLabel']();

    expect(label).toContain('2 trading days');
    expect(label).toContain('+70.00');
    expect(label).toContain('EUR');
  });

  it('ariaLabel handles empty data', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.summaries = {};
    fixture.detectChanges();

    const chart = fixture.componentInstance.chart();
    const label = chart['ariaLabel']();

    expect(label).toBe('No trading data available for this month');
  });

  it('container has role="img" and aria-label', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.summaries = {};
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('[role="img"]');
    expect(container).toBeTruthy();
    expect(container.getAttribute('aria-label')).toBeTruthy();
  });
});
