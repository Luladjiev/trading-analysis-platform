import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TradeDataService } from '../../services/trade-data/trade-data.service';
import { NavigationStateService } from '../../services/navigation-state/navigation-state.service';
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
  protected readonly nav = inject(NavigationStateService);
  readonly currency = this.tradeData.account.currency;

  readonly currentYear = this.nav.currentYear;
  readonly currentMonth = this.nav.currentMonth;

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
    this.nav.navigateMonth(delta);
  }
}
