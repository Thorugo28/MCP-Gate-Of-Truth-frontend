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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';
import { CreateUpstreamRequest, UpstreamDto } from '../../../../shared/core/api/upstream.dto';
import {
  CreateUpstreamError,
  createUpstreamErrorOf,
  envEntryError,
  EnvEntry,
  parseArgs,
  toEnv,
  upstreamKeyError,
} from '../../core/upstream-create';

export interface UpstreamCreateDialogData {
  /** Comandos permitidos no gateway, já resolvidos; só sugestão. */
  allowedCommands: Signal<string[]>;
  create: (request: CreateUpstreamRequest) => Observable<UpstreamDto>;
}

const NO_ERROR: CreateUpstreamError = { key: null, form: null };

/** Formulário de novo upstream; fecha sozinho no 201 (o aviso e o recarregamento ficam com o store). */
@Component({
  selector: 'got-upstream-create-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './upstream-create-dialog.component.html',
  styleUrl: './upstream-create-dialog.component.scss',
})
export class UpstreamCreateDialogComponent {
  protected readonly data = inject<UpstreamCreateDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UpstreamCreateDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly key = signal('');
  protected readonly command = signal('');
  protected readonly args = signal('');
  protected readonly env = signal<EnvEntry[]>([]);
  /** Mostra os erros locais só depois de tentar cadastrar. */
  protected readonly touched = signal(false);
  protected readonly submitting = signal(false);
  protected readonly serverError = signal<CreateUpstreamError>(NO_ERROR);

  private readonly localKeyError = computed(() => upstreamKeyError(this.key().trim()));
  protected readonly keyError = computed(
    () => this.serverError().key ?? (this.touched() ? this.localKeyError() : null),
  );
  private readonly localCommandError = computed(() =>
    this.command().trim() === '' ? 'Escolha ou digite o comando.' : null,
  );
  protected readonly commandError = computed(() =>
    this.touched() ? this.localCommandError() : null,
  );
  /** Erro de cada linha do env, na mesma ordem; o de segredo literal aparece já ao digitar. */
  protected readonly envErrors = computed(() =>
    this.env().map((entry, _, all) => envEntryError(entry, all)),
  );
  protected readonly commandOptions = computed(() => {
    const typed = this.command().trim().toLowerCase();
    return this.data.allowedCommands().filter((c) => c.toLowerCase().includes(typed));
  });

  protected setKey(key: string): void {
    this.key.set(key);
    this.serverError.set(NO_ERROR);
  }

  protected setCommand(command: string): void {
    this.command.set(command);
    this.serverError.update((e) => ({ ...e, form: null }));
  }

  protected setArgs(args: string): void {
    this.args.set(args);
    this.serverError.update((e) => ({ ...e, form: null }));
  }

  protected addEnv(): void {
    this.env.update((entries) => [...entries, { name: '', value: '' }]);
  }

  protected removeEnv(index: number): void {
    this.env.update((entries) => entries.filter((_, i) => i !== index));
    this.serverError.update((e) => ({ ...e, form: null }));
  }

  protected setEnv(index: number, field: keyof EnvEntry, value: string): void {
    this.env.update((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)),
    );
    this.serverError.update((e) => ({ ...e, form: null }));
  }

  protected submit(): void {
    this.touched.set(true);
    const invalid =
      this.localKeyError() !== null ||
      this.localCommandError() !== null ||
      this.envErrors().some((e) => e !== null);
    if (invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.serverError.set(NO_ERROR);
    this.data
      .create({
        key: this.key().trim(),
        command: this.command().trim(),
        args: parseArgs(this.args()),
        env: toEnv(this.env()),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (error: unknown) => {
          this.submitting.set(false);
          this.serverError.set(createUpstreamErrorOf(error));
        },
      });
  }
}
