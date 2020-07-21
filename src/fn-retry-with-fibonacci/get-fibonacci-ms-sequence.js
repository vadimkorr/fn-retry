import { getFibonacciSequence } from '../../src/fn-retry-with-fibonacci/get-fibonacci-sequence'
import { secToMs } from '../../src/utils/convert'

export const getFibonacciMsSequence = len =>
  getFibonacciSequence(len).map(secToMs)

export const getFibonacciMsSequenceByCalls = calls => {
  if (calls < 1) throw new Error('Min value of calls is 1')
  return getFibonacciMsSequence(calls - 1)
}
