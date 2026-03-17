import { describe, expect, it } from 'vitest';

import isValidTFN from '../src/is-valid-tfn.js';

describe('isValidTFN', () => {
  it('returns false for undefined and nullish input', () => {
    expect(isValidTFN(undefined)).toBe(false);
    expect(isValidTFN(null)).toBe(false);
  });

  it('returns false for empty and whitespace-only strings', () => {
    expect(isValidTFN('')).toBe(false);
    expect(isValidTFN('   ')).toBe(false);
  });

  it('returns true for a valid 9-digit TFN', () => {
    expect(isValidTFN('876543210')).toBe(true);
  });

  it('returns true for a valid 9-digit TFN with spaces', () => {
    expect(isValidTFN('876 543 210')).toBe(true);
  });

  it('returns true for a valid legacy 8-digit TFN', () => {
    expect(isValidTFN('12345677')).toBe(true);
  });

  it('supports numeric-like input via toString()', () => {
    expect(isValidTFN(876543210)).toBe(true);
    expect(
      isValidTFN({
        toString() {
          return '876543210';
        },
      }),
    ).toBe(true);
  });

  it('returns false for an invalid checksum', () => {
    expect(isValidTFN('876543211')).toBe(false);
  });

  it('returns false for malformed lengths', () => {
    expect(isValidTFN('1234567')).toBe(false);
    expect(isValidTFN('1234567890')).toBe(false);
  });

  it('rejects alphabetic characters instead of stripping them', () => {
    expect(isValidTFN('87654A3210')).toBe(false);
  });

  it('rejects substitute reporting codes', () => {
    expect(isValidTFN('000000000')).toBe(false);
    expect(isValidTFN('111111111')).toBe(false);
    expect(isValidTFN('333333333')).toBe(false);
    expect(isValidTFN('444444444')).toBe(false);
    expect(isValidTFN('987654321')).toBe(false);
  });

  it('rejects unsupported punctuation', () => {
    expect(isValidTFN('876-543-210')).toBe(false);
  });
});
