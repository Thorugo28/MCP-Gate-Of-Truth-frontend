import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ToolDto } from '../../../../shared/core/api/tool.dto';
import { UpstreamOption } from '../../core/tool-call.store';

@Component({
  selector: 'got-tool-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './tool-picker.component.html',
  styleUrl: './tool-picker.component.scss',
})
export class ToolPickerComponent {
  readonly upstreams = input.required<UpstreamOption[]>();
  readonly tools = input.required<ToolDto[]>();
  readonly upstreamKey = input.required<string | null>();
  readonly toolName = input.required<string | null>();
  readonly loadingUpstreams = input(false);
  readonly loadingTools = input(false);

  readonly upstreamChange = output<string>();
  readonly toolChange = output<string>();
}
