import type { Mock } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UpstreamDto } from '../../../../shared/core/api/upstream.dto';
import { ApiError } from '../../../../shared/core/http/http-error';
import {
  UpstreamCreateDialogComponent,
  UpstreamCreateDialogData,
} from './upstream-create-dialog.component';

describe('UpstreamCreateDialogComponent', () => {
  let create: Mock<UpstreamCreateDialogData['create']>;
  let close: Mock;
  let fixture: ComponentFixture<UpstreamCreateDialogComponent>;

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function type(selector: string, value: string): void {
    const field = element().querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  async function addEnv(name: string, value: string): Promise<void> {
    const add = Array.from(element().querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Adicionar variável'),
    )!;
    add.click();
    await fixture.whenStable();
    const rows = element().querySelectorAll('.env-row');
    const [nameInput, valueInput] = Array.from(
      rows[rows.length - 1].querySelectorAll<HTMLInputElement>('input'),
    );
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
    valueInput.value = value;
    valueInput.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  function fill(key = 'docs'): void {
    type('input[name="key"]', key);
    type('input[name="command"]', '${NPX_CMD}');
    type(
      'textarea[name="args"]',
      '-y\n@modelcontextprotocol/server-filesystem\n/home/x/Meus Docs\n',
    );
  }

  beforeEach(async () => {
    create = vi.fn<UpstreamCreateDialogData['create']>();
    close = vi.fn();
    const data: UpstreamCreateDialogData = {
      allowedCommands: signal(['/usr/bin/npx']),
      create,
    };
    TestBed.configureTestingModule({
      imports: [UpstreamCreateDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    fixture = TestBed.createComponent(UpstreamCreateDialogComponent);
    await fixture.whenStable();
  });

  it('warns that it runs a process on the gateway machine', () => {
    expect(element().textContent).toContain('roda um processo na máquina do gateway');
  });

  it('sends args one per line and env as an object, then closes', async () => {
    create.mockReturnValue(of({ key: 'docs' } as UpstreamDto));
    fill();
    await addEnv('PATH', '${NODE_BIN}:/usr/bin');

    await submit();

    expect(create).toHaveBeenCalledWith({
      key: 'docs',
      command: '${NPX_CMD}',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/x/Meus Docs'],
      env: { PATH: '${NODE_BIN}:/usr/bin' },
    });
    expect(close).toHaveBeenCalledWith(true);
  });

  it('validates the key locally before calling the gateway', async () => {
    fill('my_docs');

    await submit();

    expect(create).not.toHaveBeenCalled();
    expect(element().textContent).toContain('sem "_"');
  });

  it('blocks a literal secret in the env', async () => {
    fill();
    await addEnv('NOTION_TOKEN', 'ntn_123');

    await submit();

    expect(create).not.toHaveBeenCalled();
    expect(element().querySelector('.env-row mat-hint.error')?.textContent).toContain(
      'nunca o valor',
    );
  });

  it('shows the backend message of a 400 at the top', async () => {
    const message = "O comando '/bin/sh' não está em gate.upstreams.allowed-commands";
    create.mockReturnValue(
      throwError(
        () =>
          new ApiError(400, 'HTTP 400', {
            cause: new HttpErrorResponse({ status: 400, error: { error: message } }),
          }),
      ),
    );
    fill();

    await submit();

    expect(element().querySelector('.form-error')?.textContent).toContain(message);
    expect(close).not.toHaveBeenCalled();
  });

  it('shows a 409 on the key field', async () => {
    create.mockReturnValue(throwError(() => new ApiError(409, 'HTTP 409')));
    fill('filesystem');

    await submit();

    expect(element().querySelector('mat-hint.error')?.textContent).toContain('Chave já usada');
  });
});
