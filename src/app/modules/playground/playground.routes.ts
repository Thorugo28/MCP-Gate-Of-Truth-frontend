import { Routes } from '@angular/router';

export const PLAYGROUND_ROUTES: Routes = [
  {
    path: '',
    title: 'Playground · Gate of Truth',
    loadComponent: () => import('./tool-call/ui/tool-call.page').then((m) => m.ToolCallPage),
  },
];
