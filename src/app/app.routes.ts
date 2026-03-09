import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./calendar/calendar-page/calendar-page').then(m => m.CalendarPage) },
];
