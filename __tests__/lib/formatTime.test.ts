import { describe, expect, it } from 'vitest';
import { formatElapsedTime } from '../../apps/mobile/lib/formatTime';

describe('formatElapsedTime', () => {
  it('formats 0 seconds as 0:00', () => {
    expect(formatElapsedTime(0)).toBe('0:00');
  });

  it('formats seconds under a minute', () => {
    expect(formatElapsedTime(5)).toBe('0:05');
    expect(formatElapsedTime(45)).toBe('0:45');
  });

  it('formats exact minutes', () => {
    expect(formatElapsedTime(60)).toBe('1:00');
    expect(formatElapsedTime(120)).toBe('2:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatElapsedTime(65)).toBe('1:05');
    expect(formatElapsedTime(123)).toBe('2:03');
    expect(formatElapsedTime(599)).toBe('9:59');
  });

  it('formats hours correctly', () => {
    expect(formatElapsedTime(3600)).toBe('1:00:00');
    expect(formatElapsedTime(3661)).toBe('1:01:01');
    expect(formatElapsedTime(7265)).toBe('2:01:05');
  });

  it('pads single digits in time components', () => {
    expect(formatElapsedTime(61)).toBe('1:01');
    expect(formatElapsedTime(3601)).toBe('1:00:01');
  });
});
