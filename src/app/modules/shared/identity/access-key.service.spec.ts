import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AccessKeyService } from './access-key.service';

describe('AccessKeyService', () => {
  let navigate: ReturnType<typeof vi.spyOn>;

  function create(): AccessKeyService {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    return TestBed.inject(AccessKeyService);
  }

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('keeps the key in sessionStorage by default', () => {
    const service = create();
    service.save('k1', false);

    expect(service.key()).toBe('k1');
    expect(sessionStorage.getItem('got-access-key')).toBe('k1');
    expect(localStorage.getItem('got-access-key')).toBeNull();
  });

  it('keeps the key in localStorage when asked to remember', () => {
    sessionStorage.setItem('got-access-key', 'old');
    const service = create();
    service.save('k1', true);

    expect(localStorage.getItem('got-access-key')).toBe('k1');
    expect(sessionStorage.getItem('got-access-key')).toBeNull();
  });

  it('reads a stored key on start', () => {
    localStorage.setItem('got-access-key', 'k1');
    expect(create().hasKey()).toBe(true);
  });

  it('signs out: forgets the key and goes to the key screen', () => {
    const service = create();
    service.save('k1', true);
    service.signOut();

    expect(service.hasKey()).toBe(false);
    expect(localStorage.getItem('got-access-key')).toBeNull();
    expect(service.notice()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/', 'chave']);
  });

  it('expires once, with a notice, and clears it on the next save', () => {
    const service = create();
    service.save('k1', false);
    service.expire();
    service.expire();

    expect(service.hasKey()).toBe(false);
    expect(service.notice()).toContain('deixou de valer');
    expect(navigate).toHaveBeenCalledTimes(1);

    service.save('k2', false);
    expect(service.notice()).toBeNull();
  });
});
