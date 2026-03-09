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
import type { DailySummary } from '../../models/trade';

@Component({
  selector: 'app-trade-list-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  host: {
    '(keydown.escape)': 'onClose()',
  },
  templateUrl: './trade-list-dialog.html',
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
