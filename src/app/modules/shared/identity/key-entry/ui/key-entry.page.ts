import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { KeyEntryStore } from '../core/key-entry.store';

@Component({
  selector: 'got-key-entry-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule],
  providers: [KeyEntryStore],
  templateUrl: './key-entry.page.html',
  styleUrl: './key-entry.page.scss',
})
export class KeyEntryPage {
  protected readonly store = inject(KeyEntryStore);
}
