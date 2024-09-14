import memoize from "./lib/sync";
import memoizeAsync from "./lib/async";
import FnMemoizeError from "./models/error"
import { FnMemoizeOptions } from './types/index'


export { memoize, memoizeAsync, FnMemoizeError, FnMemoizeOptions }