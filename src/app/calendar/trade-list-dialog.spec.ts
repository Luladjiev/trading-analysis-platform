import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TradeListDialog } from './trade-list-dialog';
import type { DailySummary } from '../models/trade';

describe('TradeListDialog', () => {
  let fixture: ComponentFixture<TradeListDialog>;
  let component: TradeListDialog;

  const summary: DailySummary = {
    date: '2024-01-15',
    tradeCount: 2,
    netPL: 120.5,
    trades: [
      { symbol: 'EURUSD', type: 'buy', volume: 0.1, commission: -1.2, swap: 0, profit: 80, netPL: 78.8 },
      { symbol: 'GBPUSD', type: 'sell', volume: 0.2, commission: -2.0, swap: -0.3, profit: 44, netPL: 41.7 },
    ],
  };

  const negativeSummary: DailySummary = {
    date: '2024-01-16',
    tradeCount: 1,
    netPL: -50,
    trades: [
      { symbol: 'USDJPY', type: 'buy', volume: 0.5, commission: -3.0, swap: 0, profit: -47, netPL: -50 },
    ],
  };

  beforeEach(() => {
    // jsdom doesn't implement HTMLDialogElement methods
    HTMLDialogElement.prototype.showModal ??= vi.fn();
    HTMLDialogElement.prototype.close ??= vi.fn();
    TestBed.configureTestingModule({ imports: [TradeListDialog] });
  });

  function createComponent(s: DailySummary) {
    fixture = TestBed.createComponent(TradeListDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('summary', s);
    fixture.detectChanges();
  }

  it('renders date in dialog title', () => {
    createComponent(summary);
    const title = fixture.nativeElement.querySelector('#dialog-title');
    expect(title.textContent).toContain('2024-01-15');
  });

  it('renders a row per trade with correct data', () => {
    createComponent(summary);
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('EURUSD');
    expect(rows[1].textContent).toContain('GBPUSD');
  });

  it('shows total net P/L with text-green-700 for positive', () => {
    createComponent(summary);
    const totalCell = fixture.nativeElement.querySelector('tfoot tr td:last-child');
    expect(totalCell.className).toContain('text-green-700');
  });

  it('shows total net P/L with text-red-700 for negative', () => {
    createComponent(negativeSummary);
    const totalCell = fixture.nativeElement.querySelector('tfoot tr td:last-child');
    expect(totalCell.className).toContain('text-red-700');
  });

  it('emits closed when close button clicked', () => {
    createComponent(summary);
    const spy = vi.fn();
    component.closed.subscribe(spy);
    const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Close dialog"]');
    closeBtn.click();
    expect(spy).toHaveBeenCalled();
  });
});
