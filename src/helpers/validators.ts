export function cacheEntityExpired(timestamp: number) {
    return timestamp !== Number.POSITIVE_INFINITY && timestamp <= Date.now();
}