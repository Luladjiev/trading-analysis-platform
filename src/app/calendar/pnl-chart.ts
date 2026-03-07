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
import { createChart, BaselineSeries, type IChartApi, type ISeriesApi, type BaselineStyleOptions, type DeepPartial } from 'lightweight-charts';
import type { DailySummary } from '../models/trade';

@Component({
  selector: 'app-pnl-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #chartContainer
      class="w-full h-96 cursor-pointer"
      role="img"
      [attr.aria-label]="ariaLabel()"
    ></div>
  `,
})
export class PnlChart {
  readonly dailySummaries = input.required<Record<string, DailySummary>>();
  readonly currency = input<string>('EUR');
  readonly daySelected = output<DailySummary>();

  private readonly chartContainer = viewChild.required<ElementRef<HTMLElement>>('chartContainer');
  private readonly destroyRef = inject(DestroyRef);

  private chart: IChartApi | null = null;
  private series: ISeriesApi<'Baseline'> | null = null;
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
      if (this.series) {
        this.series.setData(data);
        this.chart?.timeScale().fitContent();
      }
    });
  }

  private initChart() {
    const container = this.chartContainer().nativeElement;

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 384,
      handleScale: false,
      handleScroll: false,
      crosshair: {
        mode: 0,
      },
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
      },
    });

    const baselineOptions: DeepPartial<BaselineStyleOptions> = {
      baseValue: { type: 'price', price: 0 },
      topLineColor: '#22c55e',
      topFillColor1: 'rgba(34, 197, 94, 0.28)',
      topFillColor2: 'rgba(34, 197, 94, 0.05)',
      bottomLineColor: '#ef4444',
      bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
      bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
    };

    this.series = this.chart!.addSeries(BaselineSeries, baselineOptions);
    this.series!.setData(this.chartData());
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
    });
  }
}
