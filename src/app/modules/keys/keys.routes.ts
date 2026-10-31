import { Routes } from '@angular/router';

export const KEYS_ROUTES: Routes = [
  {
    path: '',
    title: 'Chaves · Gate of Truth',
    loadComponent: () => import('./key-list/ui/key-list.page').then((m) => m.KeyListPage),
  },
];
