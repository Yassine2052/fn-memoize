import { memoize } from '../src/';

describe('memoize', () => {
  
  it('should cache results based on arguments', () => {
    const fn = jest.fn((a, b) => a + b);
    const memoizedFn = memoize(fn);

    expect(memoizedFn(1, 2)).toBe(3);
    expect(memoizedFn(1, 2)).toBe(3);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should evict oldest entry when cacheSize is exceeded', () => {
    const fn = jest.fn(a => a * 2);
    const memoizedFn = memoize(fn, { cacheSize: 2 });

    memoizedFn(1);
    memoizedFn(2);
    memoizedFn(3);

    expect(memoizedFn(1)).toBe(2);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('should use custom keyExtractor function', () => {
    const fn = jest.fn(a => a * 2);
    const keyExtractor = jest.fn((...args) => args[0]);
    const memoizedFn = memoize(fn, { keyExtractor });

    memoizedFn(1);
    memoizedFn(1);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should clear all cache entries when clearCache is called', () => {
    const fn = jest.fn(a => a * 2);
    const memoizedFn = memoize(fn, { cacheSize: 2 });

    memoizedFn(1);
    memoizedFn(2);
    memoizedFn.clearCache();

    expect(memoizedFn(1)).toBe(2);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should expire cache based on timestamp', () => {
    const fn = jest.fn(a => a * 2);
    const memoizedFn = memoize(fn, { timestamp: 1000 });

    const originalDateNow = Date.now;

    jest.spyOn(global.Date, 'now').mockReturnValue(1000);
    memoizedFn(1);

    jest.spyOn(global.Date, 'now').mockReturnValue(3000);
    memoizedFn.deleteExpiredCache();

    expect(memoizedFn(1)).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);

    Date.now = originalDateNow;
  });
});