import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterLink } from '@angular/router';
import { ToolDto } from '../../../../shared/core/api/tool.dto';
import { playgroundLink } from '../../../../shared/core/routes/app-paths';
import { JsonBlockComponent } from '../../../../shared/ui/json-block/json-block.component';

@Component({
  selector: 'got-tool-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatExpansionModule, RouterLink, JsonBlockComponent],
  templateUrl: './tool-list.component.html',
  styleUrl: './tool-list.component.scss',
})
export class ToolListComponent {
  readonly tools = input.required<ToolDto[]>();

  protected readonly playgroundLink = playgroundLink;
}
