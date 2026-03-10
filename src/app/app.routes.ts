import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./overview/overview-page/overview-page').then(m => m.OverviewPage) },
  { path: 'calendar', loadComponent: () => import('./calendar/calendar-page/calendar-page').then(m => m.CalendarPage) },
  { path: 'cumulative-pnl', loadComponent: () => import('./cumulative-pnl/cumulative-pnl-page/cumulative-pnl-page').then(m => m.CumulativePnlPage) },
];
