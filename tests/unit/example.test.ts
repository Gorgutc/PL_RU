import { describe, it, expect } from 'vitest';

describe('starter sanity', () => {
  it('arithmetic still works', () => {
    expect(2 + 2).toBe(4);
  });

  it('environment has happy-dom globals', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });
});
