import { Routes } from '@angular/router';

export const UPSTREAMS_ROUTES: Routes = [
  {
    path: '',
    title: 'Upstreams · Gate of Truth',
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
