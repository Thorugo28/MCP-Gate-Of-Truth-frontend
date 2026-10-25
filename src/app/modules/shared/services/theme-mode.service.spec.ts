import { TestBed } from '@angular/core/testing';
import { ThemeModeService } from './theme-mode.service';

describe('ThemeModeService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  it('starts from the stored mode', () => {
    localStorage.setItem('got-theme-mode', 'dark');
    expect(TestBed.inject(ThemeModeService).mode()).toBe('dark');
  });

  it('toggle forces the opposite mode, stores it and marks <html>', () => {
    const service = TestBed.inject(ThemeModeService);
    const before = service.mode();

    service.toggle();
    TestBed.tick();

    const after = before === 'dark' ? 'light' : 'dark';
    expect(service.mode()).toBe(after);
    expect(localStorage.getItem('got-theme-mode')).toBe(after);
    expect(document.documentElement.dataset['theme']).toBe(after);
  });
});
