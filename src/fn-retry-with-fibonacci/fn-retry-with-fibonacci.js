import { get } from '../../src/utils/get'
import { fnRetry } from '../../src/fn-retry'
import { getFibonacciMsSequenceByCalls } from '../../src/fn-retry-with-fibonacci/get-fibonacci-ms-sequence'
import { errorMessages } from '../../src/config'

export const fnRetryWithFibonacci = async (fn, options) => {
  const _calls = get(options, 'calls', 1)
  if (typeof _calls !== 'number') throw new Error(errorMessages.CALL_TYPE)
  if (_calls < 1) throw new Error(errorMessages.CALL_VALUE)

  const delays = getFibonacciMsSequenceByCalls(_calls)
  return fnRetry(fn, {
    ...options,
    delays,
  })
}
