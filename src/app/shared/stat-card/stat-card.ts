import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col gap-3 p-5 bg-cool-grey/40 border border-white/5 hover:border-white/10 transition-colors h-full"
    >
      <div class="flex items-center gap-3">
        <span
          class="material-symbols-outlined text-2xl"
          [style.color]="iconColorValue()"
          aria-hidden="true"
          >{{ icon() }}</span
        >
        <span class="text-sm text-slate-400 uppercase tracking-widest">{{ title() }}</span>
      </div>
      <div class="text-2xl tracking-tight" [style.color]="valueColorValue()">
        {{ value() }}
      </div>
      @if (progress() !== null) {
        <div
          class="w-full h-1 mt-1 overflow-hidden"
          [class]="progressBgClass()"
          role="progressbar"
          [attr.aria-valuenow]="progress()"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-label]="title() + ' progress'"
        >
          @if (secondaryProgress() !== null) {
            <div class="flex h-full">
              <div
                class="h-full"
                [style.width.%]="progress()"
                [style.background-color]="progressColorValue()"
              ></div>
              <div
                class="h-full"
                [style.width.%]="secondaryProgress()"
                [style.background-color]="secondaryProgressColorValue()"
              ></div>
            </div>
          } @else {
            <div
              class="h-full"
              [style.width.%]="progress()"
              [style.background-color]="progressColorValue()"
            ></div>
          }
        </div>
      }
      @if (subtitle()) {
        <span class="text-xs text-slate-500">{{ subtitle() }}</span>
      }
    </div>
  `,
})
export class StatCard {
  readonly icon = input.required<string>();
  readonly iconColor = input<string>('primary');
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly valueColor = input<string>('');
  readonly subtitle = input<string>('');
  readonly progress = input<number | null>(null);
  readonly progressColor = input<string>('primary');
  readonly secondaryProgress = input<number | null>(null);
  readonly secondaryProgressColor = input<string>('');

  private static readonly COLOR_MAP: Record<string, string> = {
    success: '#00ff41',
    danger: '#ff3131',
    primary: '#258cf4',
    slate: '#94a3b8',
  };

  protected readonly iconColorValue = computed(
    () => StatCard.COLOR_MAP[this.iconColor()] ?? this.iconColor(),
  );
  protected readonly valueColorValue = computed(() => {
    const c = this.valueColor();
    return c ? (StatCard.COLOR_MAP[c] ?? c) : '#f1f5f9';
  });
  private static readonly BG_CLASS_MAP: Record<string, string> = {
    success: 'bg-success/20',
    danger: 'bg-danger/20',
    primary: 'bg-primary/20',
    slate: 'bg-slate-400/20',
  };
  protected readonly progressBgClass = computed(
    () => StatCard.BG_CLASS_MAP[this.progressColor()] ?? 'bg-white/10',
  );
  protected readonly progressColorValue = computed(
    () => StatCard.COLOR_MAP[this.progressColor()] ?? this.progressColor(),
  );
  protected readonly secondaryProgressColorValue = computed(
    () => StatCard.COLOR_MAP[this.secondaryProgressColor()] ?? this.secondaryProgressColor(),
  );
}
