import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-calendar-weekly-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  host: {
    role: 'gridcell',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'hostClasses()',
  },
  template: `
    @if (tradeCount()) {
      <span class="text-[10px] tracking-wider uppercase text-slate-500">PnL</span>
      <span [class]="plClass()" class="text-sm">
        {{ plPrefix() }}{{ netPL() | currency: currency() : 'symbol-narrow' : '1.2-2' }}
      </span>
    }
  `,
})
export class CalendarWeeklyCell {
  readonly netPL = input(0);
  readonly tradeCount = input(0);
  readonly currency = input('EUR');

  protected readonly plPrefix = computed(() => (this.netPL() >= 0 ? '+' : ''));

  protected readonly plClass = computed(() => {
    const pl = this.netPL();
    if (pl > 0) return 'text-success';
    if (pl < 0) return 'text-danger';
    return 'text-slate-400';
  });

  protected readonly hostClasses = computed(
    () =>
      'min-h-[100px] flex flex-col justify-center items-center border-l border-cool-grey bg-background-dark/20',
  );

  protected readonly ariaLabel = computed(() => {
    const count = this.tradeCount();
    if (!count) return 'Weekly total: no trades';
    const dir = this.netPL() >= 0 ? 'profit' : 'loss';
    return `Weekly total: ${dir} ${Math.abs(this.netPL())} ${this.currency()}, ${count} trades`;
  });
}
