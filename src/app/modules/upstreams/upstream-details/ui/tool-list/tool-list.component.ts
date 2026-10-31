import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { playgroundLink } from '../../../../shared/core/routes/app-paths';
import { JsonBlockComponent } from '../../../../shared/ui/json-block/json-block.component';
import { ToolRow } from '../../core/upstream-details.store';

export interface ToolEnabledChange {
  tool: ToolRow;
  enabled: boolean;
}

@Component({
  selector: 'got-tool-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatSlideToggleModule,
    RouterLink,
    JsonBlockComponent,
  ],
  templateUrl: './tool-list.component.html',
  styleUrl: './tool-list.component.scss',
})
export class ToolListComponent {
  readonly tools = input.required<ToolRow[]>();

  readonly enabledChange = output<ToolEnabledChange>();

  protected readonly playgroundLink = playgroundLink;
}
