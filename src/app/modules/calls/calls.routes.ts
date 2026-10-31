import { Routes } from '@angular/router';

export const CALLS_ROUTES: Routes = [
  {
    path: '',
    title: 'Registros do alquimista · Gate of Truth',
    loadComponent: () => import('./call-list/ui/call-list.page').then((m) => m.CallListPage),
  },
];
