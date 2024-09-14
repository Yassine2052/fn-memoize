export function defaultKeyExtractor(...fn_args: any[]) {
    return JSON.stringify(fn_args);
}