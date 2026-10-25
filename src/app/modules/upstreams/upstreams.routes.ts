import { Routes } from '@angular/router';
import { UpstreamListStore } from './upstream-list/core/upstream-list.store';

export const UPSTREAMS_ROUTES: Routes = [
  {
    path: '',
    title: 'Upstreams · Gate of Truth',
    providers: [UpstreamListStore],
    loadComponent: () =>
      import('./upstream-list/ui/upstream-list.page').then((m) => m.UpstreamListPage),
  },
  {
    path: ':key',
    title: 'Upstream · Gate of Truth',
    loadComponent: () =>
      import('./upstream-details/ui/upstream-details.page').then((m) => m.UpstreamDetailsPage),
  },
];
