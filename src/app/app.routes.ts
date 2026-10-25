import { Routes } from '@angular/router';
import { AppPaths } from './modules/shared/core/routes/app-paths';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: AppPaths.upstreams },
  {
    path: AppPaths.upstreams,
    loadChildren: () =>
      import('./modules/upstreams/upstreams.routes').then((m) => m.UPSTREAMS_ROUTES),
  },
  {
    path: AppPaths.playground,
    loadChildren: () =>
      import('./modules/playground/playground.routes').then((m) => m.PLAYGROUND_ROUTES),
  },
  { path: '**', redirectTo: AppPaths.upstreams },
];
