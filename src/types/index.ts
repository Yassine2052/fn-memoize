export type FnMemoizeOptions<T extends any[] = any[]> = Partial<{
    timestamp: number,
    cacheSize: number,
    keyExtractor: (...fn_args: T)=> any 
}>;

export type AnyMemoizableFunction = (...args: any) => any;
export type AnyAsyncMemoizableFunction = (...args: any) => Promise<any>;

export type MemoizedFunctionBase = {
    clearCache: () => void;
    deleteExpiredCache: ()=> void
};

export type MemoizedFunction<T extends AnyMemoizableFunction> = T & MemoizedFunctionBase;
export type MemoizedAsyncFunction<T extends AnyAsyncMemoizableFunction> = T & MemoizedFunctionBase;

export type MemoizedCacheEntity<T> = {
    data: T,
    timestamp: number
}

export type AsyncReturnType<T extends AnyMemoizableFunction> = T extends (...args: any) => Promise<infer R> ? R : ReturnType<T>;