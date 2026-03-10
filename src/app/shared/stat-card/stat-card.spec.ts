import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StatCard } from './stat-card';

@Component({
  imports: [StatCard],
  template: `
    <app-stat-card
      icon="trending_up"
      iconColor="success"
      title="Gross Profit"
      value="$1,234.56"
      valueColor="success"
      subtitle="5 winning trades"
      [progress]="progress"
      progressColor="success"
      [secondaryProgress]="secondaryProgress"
      secondaryProgressColor="danger"
    />
  `,
})
class TestHost {
  progress: number | null = 75;
  secondaryProgress: number | null = null;
}

describe('StatCard', () => {
  let fixture: ComponentFixture<TestHost>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should render title and value', () => {
    expect(el.textContent).toContain('Gross Profit');
    expect(el.textContent).toContain('$1,234.56');
  });

  it('should render icon with aria-hidden', () => {
    const icon = el.querySelector('.material-symbols-outlined');
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    expect(icon!.textContent!.trim()).toBe('trending_up');
  });

  it('should render subtitle', () => {
    expect(el.textContent).toContain('5 winning trades');
  });

  it('should render progress bar with aria attributes', () => {
    const progressbar = el.querySelector('[role="progressbar"]');
    expect(progressbar).toBeTruthy();
    expect(progressbar!.getAttribute('aria-valuenow')).toBe('75');
    expect(progressbar!.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar!.getAttribute('aria-valuemax')).toBe('100');
  });

  it('should not render progress bar when progress is null', () => {
    fixture.componentInstance.progress = null;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const progressbar = el.querySelector('[role="progressbar"]');
    expect(progressbar).toBeNull();
  });

  it('should render split bar when secondaryProgress is set', () => {
    fixture.componentInstance.secondaryProgress = 25;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const progressbar = el.querySelector('[role="progressbar"]');
    expect(progressbar).toBeTruthy();
    const bars = progressbar!.querySelectorAll('[style*="width"]');
    expect(bars.length).toBe(2);
  });
});
