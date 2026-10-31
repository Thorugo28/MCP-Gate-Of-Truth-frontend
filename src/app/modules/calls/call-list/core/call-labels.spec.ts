import { durationLabel, timeLabel, viaLabel } from './call-labels';

describe('call labels', () => {
  it('formats the duration in ms below one second and in seconds above', () => {
    expect(durationLabel(12)).toBe('12 ms');
    expect(durationLabel(999)).toBe('999 ms');
    expect(durationLabel(5001)).toBe('5,0 s');
    expect(durationLabel(60_000)).toBe('60,0 s');
  });

  it('names where the call came from', () => {
    expect(viaLabel('mcp')).toBe('MCP');
    expect(viaLabel('admin')).toBe('Playground');
  });

  it('formats the time as day/month and hh:mm:ss', () => {
    expect(timeLabel('2026-10-26T22:15:03Z')).toMatch(/^\d{2}\/\d{2}, \d{2}:\d{2}:\d{2}$/);
  });
});
