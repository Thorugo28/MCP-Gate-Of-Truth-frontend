import type { Mock } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, of, throwError } from 'rxjs';
import { AuthorizeResponse } from '../../core/api/upstream.dto';
import { ApiError } from '../../core/http/http-error';
import { AuthorizeDialogComponent } from './authorize-dialog.component';

describe('AuthorizeDialogComponent', () => {
  let close: Mock;
  let fixture: ComponentFixture<AuthorizeDialogComponent>;

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function apiError(status: number, body: unknown = null): ApiError {
    return new ApiError(status, `HTTP ${status}`, {
      cause: new HttpErrorResponse({ status, error: body }),
    });
  }

  async function open(response: Observable<AuthorizeResponse>): Promise<void> {
    close = vi.fn();
    TestBed.configureTestingModule({
      imports: [AuthorizeDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { key: 'notion-remoto', authorize: () => response } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    fixture = TestBed.createComponent(AuthorizeDialogComponent);
    await fixture.whenStable();
  }

  it('shows the login as a link opened by the click, without window.open', async () => {
    const windowOpen = vi.spyOn(window, 'open');
    await open(of({ authorizationUrl: 'https://mcp.notion.com/authorize?state=abc' }));

    const link = element().querySelector<HTMLAnchorElement>('a')!;
    expect(link.textContent).toContain('Abrir login do Notion');
    expect(link.href).toBe('https://mcp.notion.com/authorize?state=abc');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
    expect(element().textContent).toContain('O link vale 10 minutos.');
    expect(windowOpen).not.toHaveBeenCalled();
  });

  it('shows the backend message of a 502', async () => {
    await open(
      throwError(() => apiError(502, { error: 'Falhou o registro no servidor de autorização' })),
    );

    expect(element().querySelector('.error')?.textContent).toContain(
      'Falhou o registro no servidor de autorização',
    );
    expect(element().querySelector('a')).toBeNull();
    expect(close).not.toHaveBeenCalled();
  });

  it('closes on 503 and 404 (the caller already handled them)', async () => {
    await open(throwError(() => apiError(503)));
    expect(close).toHaveBeenCalled();

    TestBed.resetTestingModule();
    await open(throwError(() => apiError(404)));
    expect(close).toHaveBeenCalled();
  });
});
