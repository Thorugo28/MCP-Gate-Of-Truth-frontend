import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { ToolCallStore } from '../core/tool-call.store';
import { ArgumentsEditorComponent } from './arguments-editor/arguments-editor.component';
import { CallResultComponent } from './call-result/call-result.component';
import { ToolPickerComponent } from './tool-picker/tool-picker.component';

@Component({
  selector: 'got-tool-call-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    ArgumentsEditorComponent,
    ErrorStateComponent,
    TransmutationLoaderComponent,
    CallResultComponent,
    ToolPickerComponent,
  ],
  providers: [ToolCallStore],
  templateUrl: './tool-call.page.html',
  styleUrl: './tool-call.page.scss',
})
export class ToolCallPage {
  protected readonly store = inject(ToolCallStore);
}
