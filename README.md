# fn-memoize

`fn-memoize` is a lightweight utility that enables efficient memoization of functions, reducing redundant computations by caching results. This package helps optimize performance for functions that are called repeatedly with the same arguments, making it especially useful for computationally expensive operations. It supports both synchronous and asynchronous functions, and features **Least Recently Used (LRU) caching** to ensure that the cache stays within a defined size, automatically evicting the least recently used items. 

With `fn-memoize`, you can easily optimize the performance of your applications while managing memory usage effectively.
## Installation

```shell
npm install fn-memoize
```
## Usage

### Sync Functions

#### Basic Usage

```js
import { memoize } from "fn-memoize";

const acc = 0;

function accumulate(num) {
    acc += num;
    return acc;
}

// Option 1: Sync Function without options (handles also async functions)
const memoizedAccumulate = memoize(accumulate);
memoizedAccumulate(5);
console.log(acc); // Prints 5
memoizedAccumulate(5);
console.log(acc); // Prints 5 (because 5 result is already cached)
memoizedAccumulate(6);
console.log(acc); // Prints 11
memoizedAccumulate(6);
console.log(acc); // Prints 11 (because 6 result is already cached)
```

#### TTL

```js
// Options 2: With time to live TTL
const memoizedAccumulate = memoize(accumulate, {
	timestamp: 5000, // milliseconds
	keyExtractor: (...fn_args) => fn_args.sort((a, b) => a - b).toString()
});

const sleep = (ms: number)=> new Promise((resolve) => {
	setTimeout(resolve, ms)
})
 
async function main() {
	memoizedAccumulate(5);
	console.log(acc); // Prints 5
	await sleep(5000);
	memoizedAccumulate(5);
	console.log(acc); // Prints 10 (because 5 result is already cached)
	await sleep(5000);
	memoizedAccumulate(6);
	console.log(acc); // Prints 16
}

main();
```

#### Cache Limited Size

**Memoized** accumulate function with limited cache size (LRU - Least Recently Used).

This will cache the results of the last 2 function calls. When a new entry exceeds the cache size, the least recently used item is removed from the cache.

```js
// Option 3: Memoize the accumulate function with a maximum cache size of 2 
const memoizedAccumulate = memoize(accumulate, { cacheSize: 2 }); 

memoizedAccumulate(5); // Cache stores the result of accumulate(5) // Cache state: [5] 

memoizedAccumulate(6); // Cache stores accumulate(6) while keeping accumulate(5) Cache state: [5, 6] (most recently used is 6) 

memoizedAccumulate(5); // Cache already has accumulate(5), so it returns the cached result and marks 5 as the most recently used. Cache state: [6, 5] (most recently used is 5) 

memoizedAccumulate(7); // Cache size is 2, so calling with a new argument (7) causes the least recently used (6) to be evicted. Cache state: [5, 7] (most recently used is 7)
```

### Async Functions

```js
import { memoizeAsync } from "fn-memoize";

// Simulating an async function that fetches user data from an API
async function fetchUserData(userId: string) {
    console.log(`Fetching data for user ${userId}...`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ userId, name: "John Doe", age: 25 });
        }, 1000);
    });
}

const memoizedFetchUserData = memoizeAsync(fetchUserData);

// Fetching data for the first time (will hit the "network")
memoizedFetchUserData("123").then((data) => console.log("First call:", data));
// Fetching data for the second time (cached result, won't hit the "network")
memoizedFetchUserData("123").then((data) => console.log("Second call (cached):", data));
// Fetching data for a different user (new call, will hit the "network")
memoizedFetchUserData("456").then((data) => console.log("New user call:", data));
```

The following code demonstrates how to manually clear cached results in a memoized function. Two methods are provided for cache management:

1. **Clear All Cached Results**: This method (`clearCache`) removes all stored values from the cache.
2. **Clear Expired Results**: This method (`deleteExpiredCache`) removes only the expired entries, preserving non-expired ones.

```js
const memoizedAccumulate = memoize(accumulate, { cacheSize: 2 }); 

// Option 1: Clear all Cached results
memoizedAccumulate.clearCache();

// Option 2: Clear expired results
memoizedAccumulate.deleteExpiredCache();
```

### `memoize(fn, options?)`

The `memoize` function takes a regular function (`fn`) and an optional `options` object. It returns a memoized version of the function, which caches its results based on the arguments passed to avoid repeated computation.

- **`fn`**:  
    The function to be memoized. It should be a synchronous function where caching results based on the input arguments provides performance improvements.
    
- **`options?`**:  
    An object that configures the behavior of the memoization. The available options include:
    
    - **`timestamp`**:  
        (Optional) A timestamp used to track when the cache entry was created. This can be useful for implementing expiration policies.  
        **Default**: `Infinity` (cache entries do not expire by default).
        
    - **`cacheSize`**:  
        (Optional) The maximum number of results to store in the cache. When the cache reaches this limit, the oldest entry is removed to make space for new ones.  
        **Default**: `16777216` (approximately 16 million entries).
        
    - **`keyExtractor`**:  
        (Optional) A custom function used to extract a cache key from the function arguments. This allows for more control over how cache keys are generated, enabling scenarios where specific arguments should be ignored or a composite key should be created.  
        **Default**: `(...fn_args) => JSON.stringify(fn_args)` (generates a cache key by serializing the function arguments).
        

---

### `memoizeAsync(asyncFn, options?)`

The `memoizeAsync` function works the same way as `memoize`, but it is used for asynchronous functions. It caches the result of the async function to avoid redundant asynchronous operations (e.g., network requests).

- **`asyncFn`**:  
    The asynchronous function to be memoized. It must return a promise that resolves to a value, which will be cached for future calls with the same arguments.
    
- **`options?`**:  
    Same configuration as `memoize`, with options for controlling cache behavior:
    
    - **`timestamp`**: Tracks when each cache entry was created.  
        **Default**: `Infinity`.
    - **`cacheSize`**: Specifies the maximum number of asynchronous results to keep in the cache.  
        **Default**: `16777216`.
    - **`keyExtractor`**: A custom function to define how cache keys are generated for asynchronous function arguments.  
        **Default**: `(...fn_args) => JSON.stringify(fn_args)`.