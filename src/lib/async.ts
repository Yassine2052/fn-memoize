import { MAP_MAX_SIZE } from "../constants";
import { defaultKeyExtractor } from "../helpers/extractors";
import { cacheEntityExpired } from "../helpers/validators";
import FnMemoizeError from "../models/error";
import { AnyAsyncMemoizableFunction, AsyncReturnType, FnMemoizeOptions, MemoizedAsyncFunction, MemoizedCacheEntity } from "../types";

export default function memoizeAsync<T extends AnyAsyncMemoizableFunction>(
    fn: T,
    { 
        timestamp = Number.POSITIVE_INFINITY, 
        cacheSize = MAP_MAX_SIZE,
        keyExtractor = defaultKeyExtractor
    }: FnMemoizeOptions = {}
): MemoizedAsyncFunction<T> {
    if(typeof fn !== "function") {
        throw new FnMemoizeError(`The first argument must be a function, but received ${typeof fn}.`);
    }

    if(typeof keyExtractor !== "function") {
        throw new FnMemoizeError(`The 'keyExtractor' option must be a function, but received ${typeof keyExtractor}.`);
    }

    if (typeof timestamp !== "number" || isNaN(timestamp)) {
        throw new FnMemoizeError(`The 'timestamp' option must be a valid number, but received ${isNaN(timestamp) ? 'NaN' : typeof timestamp}.`);
    }

    if (timestamp < 0) {
        throw new FnMemoizeError("The 'timestamp' option cannot be negative.");
    }

    cacheSize = typeof cacheSize === "number" ? cacheSize || MAP_MAX_SIZE : MAP_MAX_SIZE;
    
    const cache = new Map<any, MemoizedCacheEntity<AsyncReturnType<T>>>();
    const memoized: MemoizedAsyncFunction<T> = (async (...args: Parameters<T>): Promise<AsyncReturnType<T>> => {
        const key = keyExtractor(...args);

        if (cache.has(key)) {
            const cachedValue = cache.get(key)!;

            if (!cacheEntityExpired(cachedValue.timestamp)) {
                cache.delete(key);
                cache.set(key, cachedValue);
                return cachedValue.data as AsyncReturnType<T>;
            }
            cache.delete(key);
        }

        const data = await fn(...args);
        cache.set(key, { data, timestamp: Date.now() + timestamp });

        if(timestamp !== 0) {
            cache.delete(key);
            cache.set(key, {
                data,
                timestamp: timestamp !== Number.POSITIVE_INFINITY ? Date.now() + timestamp : Number.POSITIVE_INFINITY
            });
            
            if(cacheSize < cache.size) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey); 
            }
        }

        return data;
    }) as MemoizedAsyncFunction<T>;

    memoized.clearCache = () => cache.clear();
    memoized.deleteExpiredCache = () => {
        for (const [key, value] of cache) {
            cacheEntityExpired(value.timestamp) && cache.delete(key);
        }
    };

    return memoized;
}