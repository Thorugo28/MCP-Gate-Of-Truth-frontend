import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import {
  ALL_UPSTREAMS,
  CreatedKeyDto,
  CreateKeyRequest,
} from '../../../../shared/core/api/key.dto';
import {
  CreateKeyError,
  createKeyErrorOf,
  keyNameError,
  mcpAddCommand,
  normalizeUpstreams,
} from '../../core/key-create';

export interface KeyCreateDialogData {
  /** Chaves dos upstreams que existem hoje no gateway. */
  upstreams: Signal<string[]>;
  mcpUrl: string;
  create: (request: CreateKeyRequest) => Observable<CreatedKeyDto>;
}

interface CreatedKey {
  name: string;
  value: string;
  command: string;
}

const NO_ERROR: CreateKeyError = { name: null, form: null };

/**
 * Duas fases: formulário e, depois do 201, o valor da chave. O valor vive só num signal deste componente
 * (não vai para store, storage, log nem URL) e some quando o diálogo fecha.
 */
@Component({
  selector: 'got-key-create-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClipboardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './key-create-dialog.component.html',
  styleUrl: './key-create-dialog.component.scss',
})
export class KeyCreateDialogComponent {
  protected readonly data = inject<KeyCreateDialogData>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly all = ALL_UPSTREAMS;

  protected readonly name = signal('');
  protected readonly upstreams = signal<string[]>([]);
  protected readonly admin = signal(false);
  /** Mostra o erro local do nome só depois de tentar criar ou sair do campo. */
  protected readonly touched = signal(false);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<CreateKeyError>(NO_ERROR);
  protected readonly created = signal<CreatedKey | null>(null);
  protected readonly copied = signal<'value' | 'command' | null>(null);

  private readonly localNameError = computed(() => keyNameError(this.name().trim()));
  protected readonly nameError = computed(
    () => this.serverError().name ?? (this.touched() ? this.localNameError() : null),
  );

  protected setName(name: string): void {
    this.name.set(name);
    this.serverError.set(NO_ERROR);
  }

  protected setUpstreams(next: string[]): void {
    this.upstreams.update((previous) => normalizeUpstreams(previous, next));
    this.serverError.set(NO_ERROR);
  }

  protected submit(): void {
    this.touched.set(true);
    if (this.localNameError() !== null || this.submitting()) {
      return;
    }
    const name = this.name().trim();
    this.submitting.set(true);
    this.serverError.set(NO_ERROR);
    this.data
      .create({ name, upstreams: this.upstreams(), admin: this.admin() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ key, value }) => {
          this.submitting.set(false);
          this.created.set({
            name: key.name,
            value,
            command: mcpAddCommand(this.data.mcpUrl, key.name, value),
          });
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.serverError.set(createKeyErrorOf(error));
        },
      });
  }
}
