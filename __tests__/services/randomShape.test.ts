import { randomShape } from '../../src/services/randomShape';

describe('randomShape tests', () => {
  it('returns random shape', () => {
    expect(randomShape('')).toMatch(/svg/);
  });

  it('returns specific shape', () => {
    expect(randomShape('rectangle')).toMatch(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/);
    expect(randomShape('triangle')).toMatch(/^<svg [^>]*>[\s]*<polygon [^>]*\/>[\s]*<\/svg>/);
    expect(randomShape('square')).toMatch(/^<svg [^>]*>[\s]*<rect [^>]*\/>[\s]*<\/svg>/);
    expect(randomShape('circle')).toMatch(/^<svg [^>]*>[\s]*<circle [^>]*\/>[\s]*<\/svg>/);
  });
});
