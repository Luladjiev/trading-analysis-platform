import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TradeDataService } from '../../services/trade-data/trade-data.service';
import { TradingStatsService } from '../../services/trading-stats/trading-stats.service';
import { StatCard } from '../../shared/stat-card/stat-card';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Component({
  selector: 'app-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatCard, CurrencyPipe, DecimalPipe],
  templateUrl: './overview-page.html',
})
export class OverviewPage {
  private readonly tradeData = inject(TradeDataService);
  private readonly statsService = inject(TradingStatsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly currency = this.tradeData.account.currency;

  readonly currentYear = signal(0);
  readonly currentMonth = signal(0);

  constructor() {
    const months = this.tradeData.getAvailableMonths();
    const params = this.route.snapshot.queryParams;
    const qYear = Number(params['year']);
    const qMonth = Number(params['month']);

    if (qYear > 0 && qMonth >= 1 && qMonth <= 12) {
      this.currentYear.set(qYear);
      this.currentMonth.set(qMonth);
    } else if (months.length > 0) {
      const last = months[months.length - 1];
      const [y, m] = last.split('-').map(Number);
      this.currentYear.set(y);
      this.currentMonth.set(m);
    }
  }

  protected readonly monthLabel = computed(() => MONTH_NAMES[this.currentMonth() - 1] ?? '');

  protected readonly monthKey = computed(
    () => `${this.currentYear()}-${String(this.currentMonth()).padStart(2, '0')}`,
  );

  protected readonly monthlyTotal = computed(() => this.tradeData.getMonthlyTotal(this.monthKey()));

  protected readonly monthSummaries = computed(() =>
    this.tradeData.getDailySummariesForMonth(this.currentYear(), this.currentMonth()),
  );

  protected readonly tradingStats = computed(() =>
    this.statsService.computeStats(this.monthSummaries(), this.currentYear(), this.currentMonth()),
  );

  protected readonly avgTrade = computed(() => {
    const stats = this.tradingStats();
    if (stats.totalTrades === 0) return 0;
    return (stats.grossProfit + stats.grossLoss) / stats.totalTrades;
  });

  protected readonly longPct = computed(() => {
    const stats = this.tradingStats();
    if (stats.totalTrades === 0) return 0;
    return (stats.longCount / stats.totalTrades) * 100;
  });

  protected readonly shortPct = computed(() => {
    const stats = this.tradingStats();
    if (stats.totalTrades === 0) return 0;
    return (stats.shortCount / stats.totalTrades) * 100;
  });

  protected readonly winProfitPct = computed(() => {
    const stats = this.tradingStats();
    const total = stats.grossProfit + Math.abs(stats.grossLoss);
    return total > 0 ? (stats.grossProfit / total) * 100 : 0;
  });

  protected readonly lossProfitPct = computed(() => {
    const stats = this.tradingStats();
    const total = stats.grossProfit + Math.abs(stats.grossLoss);
    return total > 0 ? (Math.abs(stats.grossLoss) / total) * 100 : 0;
  });

  navigateMonth(delta: number) {
    let m = this.currentMonth() + delta;
    let y = this.currentYear();
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    this.currentYear.set(y);
    this.currentMonth.set(m);
    this.router.navigate([], {
      queryParams: { year: y, month: m },
      replaceUrl: true,
    });
  }
}
