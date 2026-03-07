import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  viewChild,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { DailySummary } from '../models/trade';

@Component({
  selector: 'app-trade-list-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  host: {
    '(keydown.escape)': 'onClose()',
  },
  template: `
    <dialog
      #dialog
      class="m-auto w-full max-w-2xl border border-cool-grey bg-cool-grey p-0 text-gray-200 shadow-xl backdrop:bg-black/40"
      [attr.aria-labelledby]="'dialog-title'"
      (click)="onBackdropClick($event)"
    >
      <div class="flex items-center justify-between border-b border-cool-grey px-6 py-4">
        <h2 id="dialog-title" class="text-lg font-semibold text-white">
          Trades on {{ summary().date }}
        </h2>
        <button
          class="p-1 text-gray-500 hover:bg-background-dark hover:text-gray-300"
          aria-label="Close dialog"
          (click)="onClose()"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="overflow-x-auto px-6 py-4">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-cool-grey text-left text-xs font-medium uppercase text-gray-500">
              <th class="pb-2 pr-3">Symbol</th>
              <th class="pb-2 pr-3">Type</th>
              <th class="pb-2 pr-3 text-right">Volume</th>
              <th class="pb-2 pr-3 text-right">Commission</th>
              <th class="pb-2 pr-3 text-right">Swap</th>
              <th class="pb-2 pr-3 text-right">Profit</th>
              <th class="pb-2 text-right">Net P/L</th>
            </tr>
          </thead>
          <tbody>
            @for (trade of summary().trades; track $index) {
              <tr class="border-b border-cool-grey">
                <td class="py-2 pr-3 font-medium">{{ trade.symbol }}</td>
                <td class="py-2 pr-3 capitalize">{{ trade.type }}</td>
                <td class="py-2 pr-3 text-right">{{ trade.volume }}</td>
                <td class="py-2 pr-3 text-right">{{ trade.commission | currency: currency() : 'symbol-narrow' : '1.2-2' }}</td>
                <td class="py-2 pr-3 text-right">{{ trade.swap | currency: currency() : 'symbol-narrow' : '1.2-2' }}</td>
                <td class="py-2 pr-3 text-right">{{ trade.profit | currency: currency() : 'symbol-narrow' : '1.2-2' }}</td>
                <td class="py-2 text-right font-semibold" [class]="trade.netPL >= 0 ? 'text-success' : 'text-danger'">
                  {{ trade.netPL >= 0 ? '+' : '' }}{{ trade.netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
                </td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr class="font-semibold">
              <td class="pt-3" [attr.colspan]="6">
                Total ({{ summary().tradeCount }} {{ summary().tradeCount === 1 ? 'trade' : 'trades' }})
              </td>
              <td class="pt-3 text-right" [class]="totalPlClass()">
                {{ totalPlPrefix() }}{{ summary().netPL | currency: currency() : 'symbol-narrow' : '1.2-2' }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </dialog>
  `,
})
export class TradeListDialog {
  readonly summary = input.required<DailySummary>();
  readonly currency = input('EUR');
  readonly closed = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly totalPlClass = computed(() =>
    this.summary().netPL >= 0 ? 'text-success' : 'text-danger',
  );

  protected readonly totalPlPrefix = computed(() =>
    this.summary().netPL >= 0 ? '+' : '',
  );

  constructor() {
    afterNextRender(() => {
      this.dialogRef().nativeElement.showModal();
    });
  }

  protected onBackdropClick(event: MouseEvent) {
    if (event.target === this.dialogRef().nativeElement) {
      this.onClose();
    }
  }

  protected onClose() {
    this.dialogRef().nativeElement.close();
    this.closed.emit();
  }
}
