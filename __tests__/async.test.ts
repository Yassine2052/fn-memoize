import { memoizeAsync } from '../src/';

const mockApiCall = jest.fn((data) => 
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Result: ${data}`);
    }, 100);
  })
);

describe('memoizeAsync', () => {
  beforeEach(() => {
    mockApiCall.mockClear(); 
  });

  it('should cache the result of an async function', async () => {
    const memoizedFn = memoizeAsync(mockApiCall);

    const result1 = await memoizedFn('test');
    expect(result1).toBe('Result: test');
    expect(mockApiCall).toHaveBeenCalledTimes(1);

    const result2 = await memoizedFn('test');
    expect(result2).toBe('Result: test');
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it('should evict oldest entry when cacheSize is exceeded', async () => {
    const memoizedFn = memoizeAsync(mockApiCall, { cacheSize: 2 });

    await memoizedFn('test1');
    await memoizedFn('test2');
    await memoizedFn('test3');

    const result = await memoizedFn('test1');
    expect(result).toBe('Result: test1');
    expect(mockApiCall).toHaveBeenCalledTimes(4);
  });

  it('should use custom keyExtractor for async function', async () => {
    const keyExtractor = jest.fn((...args) => args[0]);
    const memoizedFn = memoizeAsync(mockApiCall, { keyExtractor });

    await memoizedFn('key1');
    expect(mockApiCall).toHaveBeenCalledTimes(1);

    await memoizedFn('key1');
    expect(mockApiCall).toHaveBeenCalledTimes(1); 

    await memoizedFn('key2');
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it('should clear all cache entries when clearCache is called', async () => {
    const memoizedFn = memoizeAsync(mockApiCall, { cacheSize: 2 });

    await memoizedFn('test1');
    await memoizedFn('test2');

    memoizedFn.clearCache();

    await memoizedFn('test1');
    expect(mockApiCall).toHaveBeenCalledTimes(3);
  });

  it('should expire cache entries based on timestamp', async () => {
    const memoizedFn = memoizeAsync(mockApiCall, { timestamp: 1000 });

    const originalDateNow = Date.now;
    Date.now = jest.fn(() => 1000); 
    await memoizedFn('test');

    Date.now = jest.fn(() => 3000);
    memoizedFn.deleteExpiredCache();

    const result = await memoizedFn('test');
    expect(result).toBe('Result: test');
    expect(mockApiCall).toHaveBeenCalledTimes(2);

    Date.now = originalDateNow;
  });

  it('should handle promise rejection and not cache failed results', async () => {
    const mockFailedApiCall = jest.fn(() => 
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('API Error'));
        }, 100);
      })
    );
    const memoizedFn = memoizeAsync(mockFailedApiCall);

    await expect(memoizedFn()).rejects.toThrow('API Error');
    expect(mockFailedApiCall).toHaveBeenCalledTimes(1);

    await expect(memoizedFn()).rejects.toThrow('API Error');
    expect(mockFailedApiCall).toHaveBeenCalledTimes(2);
  });
});
