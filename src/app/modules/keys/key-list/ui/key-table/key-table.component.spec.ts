import { TestBed } from '@angular/core/testing';
import { KeyRow } from '../../core/key-list.store';
import { KeyTableComponent } from './key-table.component';

describe('KeyTableComponent', () => {
  const base: KeyRow = {
    name: 'teste',
    origin: 'panel',
    originLabel: 'Painel',
    upstreams: ['filesystem'],
    admin: false,
    created: '28/10 por painel',
    status: 'Ativa',
    revoked: false,
    canRevoke: true,
  };

  it('shows the revoke button only on active panel keys', async () => {
    const fixture = TestBed.createComponent(KeyTableComponent);
    fixture.componentRef.setInput('rows', [
      base,
      { ...base, name: 'cli', origin: 'file', originLabel: 'Arquivo', canRevoke: false },
      { ...base, name: 'antiga', revoked: true, status: 'Revogada', canRevoke: false },
    ]);
    await fixture.whenStable();

    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tr[mat-row]'));
    const buttons = rows.map((row) => row.querySelector('button')?.textContent?.trim() ?? null);
    expect(buttons).toEqual([expect.stringContaining('Revogar'), null, null]);
    expect(rows[1].textContent).toContain('lock');
  });
});
