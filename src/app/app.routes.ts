import { Routes } from '@angular/router';
import { AppPaths } from './modules/shared/core/routes/app-paths';
import { accessKeyGuard } from './modules/shared/identity/access-key.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: AppPaths.upstreams },
  {
    path: AppPaths.upstreams,
    canActivate: [accessKeyGuard],
    loadChildren: () =>
      import('./modules/upstreams/upstreams.routes').then((m) => m.UPSTREAMS_ROUTES),
  },
  {
    path: AppPaths.playground,
    canActivate: [accessKeyGuard],
    loadChildren: () =>
      import('./modules/playground/playground.routes').then((m) => m.PLAYGROUND_ROUTES),
  },
  {
    path: AppPaths.accessKey,
    title: 'Chave de acesso · Gate of Truth',
    loadComponent: () =>
      import('./modules/shared/identity/key-entry/ui/key-entry.page').then((m) => m.KeyEntryPage),
  },
  { path: '**', redirectTo: AppPaths.upstreams },
];
