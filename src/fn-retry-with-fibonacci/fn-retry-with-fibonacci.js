import { get } from '../../src/utils/get'
import { fnRetry } from '../../src/fn-retry'
import { getFibonacciMsSequenceByCalls } from '../../src/fn-retry-with-fibonacci/get-fibonacci-ms-sequence'

export const fnRetryWithFibonacci = async (fn, options) => {
  const _calls = get(options, 'calls', 1)
  if (_calls < 1) throw new Error('At least one call should be done')

  const delays = getFibonacciMsSequenceByCalls(_calls)
  return fnRetry(fn, {
    ...options,
    delays,
  })
}
