import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppPaths } from './modules/shared/core/routes/app-paths';
import { ThemeModeService } from './modules/shared/services/theme-mode.service';
import { LogoComponent } from './modules/shared/ui/logo/logo.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'got-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    LogoComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly themeMode = inject(ThemeModeService);

  protected readonly navItems: NavItem[] = [
    { path: AppPaths.upstreams, label: 'Upstreams', icon: 'hub' },
    { path: AppPaths.playground, label: 'Playground', icon: 'play_circle' },
  ];
}
