import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccessKeyApi } from '../../../core/api/access-key.api';
import { ApiError } from '../../../core/http/http-error';
import { AccessKeyService } from '../../access-key.service';
import { KeyEntryStore } from './key-entry.store';

describe('KeyEntryStore', () => {
  let verify: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.spyOn>;
  let store: KeyEntryStore;
  let accessKey: AccessKeyService;

  beforeEach(() => {
    verify = vi.fn(() => of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        KeyEntryStore,
        { provide: AccessKeyApi, useValue: { verify } },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    store = TestBed.inject(KeyEntryStore);
    accessKey = TestBed.inject(AccessKeyService);
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('does not submit an empty key', () => {
    store.setKey('   ');
    store.submit();
    expect(store.canSubmit()).toBe(false);
    expect(verify).not.toHaveBeenCalled();
  });

  it('saves a valid key (trimmed) and goes to the upstream list', () => {
    store.setKey(' k1 ');
    store.remember.set(true);
    store.submit();

    expect(verify).toHaveBeenCalledWith('k1');
    expect(accessKey.key()).toBe('k1');
    expect(localStorage.getItem('got-access-key')).toBe('k1');
    expect(navigate).toHaveBeenCalledWith(['/', 'upstreams']);
  });

  it.each([
    [401, 'Chave inválida'],
    [403, 'não tem acesso ao painel'],
  ])('does not save the key on %i', (status, message) => {
    verify.mockReturnValue(throwError(() => new ApiError(status, 'recusada')));
    store.setKey('k1');
    store.submit();

    expect(store.errorMessage()).toContain(message);
    expect(store.errorMessage()).not.toContain('k1');
    expect(store.isVerifying()).toBe(false);
    expect(accessKey.hasKey()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows the gateway message when it is down', () => {
    verify.mockReturnValue(throwError(() => new ApiError(0, 'gateway fora do ar')));
    store.setKey('k1');
    store.submit();
    expect(store.errorMessage()).toBe('gateway fora do ar');
  });

  it('clears the error when the key changes', () => {
    verify.mockReturnValue(throwError(() => new ApiError(401, 'recusada')));
    store.setKey('k1');
    store.submit();
    store.setKey('k2');
    expect(store.errorMessage()).toBeNull();
  });
});
