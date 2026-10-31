import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the nav links', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('a[mat-list-item]'),
    ).map((a) => a.textContent?.trim());
    expect(links).toEqual([
      expect.stringContaining('Upstreams'),
      expect.stringContaining('Playground'),
      expect.stringContaining('Chamadas'),
      expect.stringContaining('Chaves'),
    ]);
  });
});
