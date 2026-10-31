import type { Mock } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ApiError } from '../../../../shared/core/http/http-error';
import { KeyCreateDialogComponent, KeyCreateDialogData } from './key-create-dialog.component';

describe('KeyCreateDialogComponent', () => {
  let create: Mock<KeyCreateDialogData['create']>;
  let fixture: ComponentFixture<KeyCreateDialogComponent>;

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  async function submitWithName(name: string): Promise<void> {
    const input = element().querySelector<HTMLInputElement>('input')!;
    input.value = name;
    input.dispatchEvent(new Event('input'));
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    create = vi.fn<KeyCreateDialogData['create']>();
    const data: KeyCreateDialogData = {
      upstreams: signal(['filesystem', 'notion']),
      mcpUrl: 'http://gw/mcp',
      create,
    };
    TestBed.configureTestingModule({
      imports: [KeyCreateDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(KeyCreateDialogComponent);
    await fixture.whenStable();
  });

  it('validates the name locally before calling the gateway', async () => {
    await submitWithName('com espaço');

    expect(create).not.toHaveBeenCalled();
    expect(element().textContent).toContain('Use só letras, números');
  });

  it('shows a 409 on the name field', async () => {
    create.mockReturnValue(throwError(() => new ApiError(409, 'HTTP 409')));

    await submitWithName('cli');

    expect(create).toHaveBeenCalledWith({ name: 'cli', upstreams: [], admin: false });
    expect(element().querySelector('mat-hint.error')?.textContent).toContain('Nome já usado');
  });

  it('shows the value and the command after the 201', async () => {
    create.mockReturnValue(
      of({
        key: {
          name: 'teste',
          upstreams: [],
          admin: false,
          origin: 'panel',
          createdAt: '2026-10-29T12:00:00Z',
          createdBy: 'painel',
          revokedAt: null,
          revokedBy: null,
        },
        value: 'segredo123',
      }),
    );

    await submitWithName('teste');

    const text = element().textContent ?? '';
    expect(text).toContain('segredo123');
    expect(text).toContain(
      'claude mcp add --transport http teste http://gw/mcp --header "Authorization: Bearer segredo123"',
    );
    expect(text).toContain('não aparece de novo');
    expect(text).toContain('Copiei, fechar');
    expect(element().querySelector('form')).toBeNull();
  });
});
