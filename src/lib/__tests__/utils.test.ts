import { parseDateToNoon, parseDateToStartOfDay, parseDateToEndOfDay } from '../utils';

describe('Date Utilities', () => {
  it('parseDateToNoon should return a date at 12:00:00 local time', () => {
    const input = '2023-10-02';
    const date = parseDateToNoon(input);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(9); // Month is 0-indexed
    expect(date.getDate()).toBe(2);
    expect(date.getHours()).toBe(12);
    expect(date.getMinutes()).toBe(0);
  });

  it('parseDateToStartOfDay should return a date at 00:00:00 local time', () => {
    const input = '2023-10-02';
    const date = parseDateToStartOfDay(input);
    expect(date.getDate()).toBe(2);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it('parseDateToEndOfDay should return a date at 23:59:59 local time', () => {
    const input = '2023-10-02';
    const date = parseDateToEndOfDay(input);
    expect(date.getDate()).toBe(2);
    expect(date.getHours()).toBe(23);
    expect(date.getMinutes()).toBe(59);
    expect(date.getSeconds()).toBe(59);
    expect(date.getMilliseconds()).toBe(999);
  });
});
