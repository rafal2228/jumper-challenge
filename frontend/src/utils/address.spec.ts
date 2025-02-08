import { describe, expect, test } from 'vitest';
import { formatAddress } from './address';

describe('formatAddress', () => {
  test('should format provided address', () => {
    const result = formatAddress('0x1234567890123456789012345678901234567890');

    expect(result).toBe('0x1234...7890');
  });

  test('should provide typescript error when provided with invalid address', () => {
    // @ts-expect-error
    formatAddress('not an address');

    // @ts-expect-error
    expect(() => formatAddress(123)).toThrow();

    // @ts-expect-error
    expect(() => formatAddress({})).toThrow();

    // @ts-expect-error
    expect(() => formatAddress(null)).toThrow();
  });
});
