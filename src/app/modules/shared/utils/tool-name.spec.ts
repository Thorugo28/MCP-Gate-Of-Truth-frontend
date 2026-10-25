import { upstreamKeyOf } from './tool-name';

describe('upstreamKeyOf', () => {
  it('takes the part before the first __', () => {
    expect(upstreamKeyOf('notion__API-post-page')).toBe('notion');
    expect(upstreamKeyOf('a__b__c')).toBe('a');
  });

  it('returns the whole name when there is no prefix', () => {
    expect(upstreamKeyOf('plain')).toBe('plain');
  });
});
