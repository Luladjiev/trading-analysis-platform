import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  effect,
  viewChild,
  ElementRef,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { createChart, BaselineSeries, LineSeries, LineStyle, type IChartApi, type ISeriesApi, type BaselineStyleOptions, type DeepPartial } from 'lightweight-charts';
import type { DailySummary } from '../../models/trade';

@Component({
  selector: 'app-pnl-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pnl-chart.html',
})
export class PnlChart {
  readonly dailySummaries = input.required<Record<string, DailySummary>>();
  readonly previousMonthSummaries = input<Record<string, DailySummary>>({});
  readonly previousMonthLabel = input<string>('');
  readonly currency = input<string>('EUR');
  readonly monthLabel = input<string>('');
  readonly daySelected = output<DailySummary>();

  private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');
  private readonly destroyRef = inject(DestroyRef);

  private chart: IChartApi | null = null;
  private series: ISeriesApi<'Baseline'> | null = null;
  private previousSeries: ISeriesApi<'Line'> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  protected readonly chartData = computed(() => {
    const summaries = this.dailySummaries();
    let cumulative = 0;
    return Object.keys(summaries)
      .sort()
      .map(key => ({
        time: key as `${number}-${number}-${number}`,
        value: cumulative += summaries[key].netPL,
      }));
  });

  protected readonly previousChartData = computed(() => {
    const summaries = this.previousMonthSummaries();
    const currentKeys = Object.keys(this.dailySummaries()).sort();
    if (currentKeys.length === 0) return [];
    // Extract current year-month to remap previous month dates
    const currentYearMonth = currentKeys[0].substring(0, 7);
    let cumulative = 0;
    return Object.keys(summaries)
      .sort()
      .map(key => {
        const day = key.substring(8); // extract DD
        return {
          time: `${currentYearMonth}-${day}` as `${number}-${number}-${number}`,
          value: cumulative += summaries[key].netPL,
        };
      });
  });

  protected readonly ariaLabel = computed(() => {
    const data = this.chartData();
    if (data.length === 0) return 'No trading data available for this month';
    const total = data[data.length - 1].value;
    const sign = total >= 0 ? '+' : '';
    return `Daily P/L chart: ${data.length} trading days, total ${sign}${total.toFixed(2)} ${this.currency()}`;
  });

  constructor() {
    afterNextRender(() => {
      this.initChart();
    });

    effect(() => {
      const data = this.chartData();
      const prevData = this.previousChartData();
      if (this.series) {
        this.series.setData(data);
        this.previousSeries?.setData(prevData);
        this.chart?.timeScale().fitContent();
      }
    });
  }

  private initChart() {
    const container = this.chartContainer().nativeElement;

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 400,
      handleScale: false,
      handleScroll: false,
      crosshair: {
        mode: 0,
      },
      layout: {
        background: { color: 'transparent' },
        textColor: '#64748b',
        fontFamily: "'Space Grotesk', sans-serif",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#2A3038', style: 0 },
      },
      rightPriceScale: {
        borderColor: '#2A3038',
      },
      timeScale: {
        borderColor: '#2A3038',
      },
    });

    const baselineOptions: DeepPartial<BaselineStyleOptions> = {
      baseValue: { type: 'price', price: 0 },
      topLineColor: '#258cf4',
      topFillColor1: 'rgba(37, 140, 244, 0.10)',
      topFillColor2: 'rgba(37, 140, 244, 0)',
      bottomLineColor: '#ff3131',
      bottomFillColor1: 'rgba(255, 49, 49, 0)',
      bottomFillColor2: 'rgba(255, 49, 49, 0.10)',
      lineWidth: 3,
    };

    this.series = this.chart!.addSeries(BaselineSeries, baselineOptions);
    this.series!.setData(this.chartData());

    this.previousSeries = this.chart!.addSeries(LineSeries, {
      color: '#2A3038',
      lineStyle: LineStyle.Dashed,
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    this.previousSeries!.setData(this.previousChartData());

    this.chart.timeScale().fitContent();

    this.chart.subscribeClick((param) => {
      if (!param.time) return;
      const dateKey = param.time as string;
      const summary = this.dailySummaries()[dateKey];
      if (summary) this.daySelected.emit(summary);
    });

    this.resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry && this.chart) {
        this.chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    this.resizeObserver.observe(container);

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.chart?.remove();
      this.chart = null;
      this.series = null;
      this.previousSeries = null;
    });
  }
}
