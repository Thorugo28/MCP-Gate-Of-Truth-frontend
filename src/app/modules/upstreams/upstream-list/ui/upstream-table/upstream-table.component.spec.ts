import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UpstreamRow } from '../../core/upstream-list.store';
import { UpstreamTableComponent } from './upstream-table.component';

describe('UpstreamTableComponent', () => {
  const base: UpstreamRow = {
    key: 'filesystem',
    status: 'UP',
    origin: 'file',
    originLabel: 'Arquivo',
    server: 'secure-filesystem-server 2.0.1',
    toolCount: 14,
    retry: null,
    authorization: null,
  };
  let fixture: ComponentFixture<UpstreamTableComponent>;

  async function render(rows: UpstreamRow[]): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      imports: [UpstreamTableComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(UpstreamTableComponent);
    fixture.componentRef.setInput('rows', rows);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function authorizeButton(row: Element): HTMLButtonElement | undefined {
    return Array.from(row.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Autorizar'),
    );
  }

  it('shows the chip and the button only when the login is needed', async () => {
    const element = await render([
      base,
      { ...base, key: 'notion-ok', authorization: 'OK' },
      { ...base, key: 'notion-remoto', status: 'DOWN', server: '—', authorization: 'NEEDED' },
    ]);
    const [none, ok, needed] = Array.from(element.querySelectorAll('tr.mat-mdc-row'));

    expect(needed.textContent).toContain('Autorização necessária');
    expect(authorizeButton(needed)).toBeDefined();
    for (const row of [none, ok]) {
      expect(row.textContent).not.toContain('Autorização');
      expect(authorizeButton(row)).toBeUndefined();
    }
  });

  it('emits the key on "Autorizar"', async () => {
    const element = await render([{ ...base, key: 'notion-remoto', authorization: 'NEEDED' }]);
    const emitted: string[] = [];
    fixture.componentInstance.authorize.subscribe((key) => emitted.push(key));

    authorizeButton(element.querySelector('tr.mat-mdc-row')!)!.click();

    expect(emitted).toEqual(['notion-remoto']);
  });
});
