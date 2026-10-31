import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { accessKeyGuard } from './access-key.guard';
import { AccessKeyService } from './access-key.service';

describe('accessKeyGuard', () => {
  function run(): ReturnType<typeof accessKeyGuard> {
    return TestBed.runInInjectionContext(() => accessKeyGuard(null!, null!));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => sessionStorage.clear());

  it('sends to the key screen without a stored key', () => {
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/chave');
  });

  it('lets the route through with a stored key', () => {
    TestBed.inject(AccessKeyService).save('k1', false);
    expect(run()).toBe(true);
  });
});
