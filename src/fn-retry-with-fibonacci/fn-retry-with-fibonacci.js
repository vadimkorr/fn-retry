import { get } from '../../src/utils/get'
import { fnRetry } from '../../src/fn-retry'
import { getFibonacciMsSequence } from '../../src/fn-retry-with-fibonacci/get-fibonacci-ms-sequence'

export const fnRetryWithFibonacci = async (fn, options) => {
  const _retries = get(options, 'retries', 0)
  const delays = getFibonacciMsSequence(_retries)
  return fnRetry(fn, {
    ...options,
    delays,
  })
}
