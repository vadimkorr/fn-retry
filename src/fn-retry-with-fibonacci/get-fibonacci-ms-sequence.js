import { getFibonacciSequence } from '../../src/fn-retry-with-fibonacci/get-fibonacci-sequence'
import { secToMs } from '../../src/utils/convert'
import { errorMessages } from '../../src/config'

export const getFibonacciMsSequence = len =>
  getFibonacciSequence(len).map(secToMs)

export const getFibonacciMsSequenceByCalls = calls => {
  if (calls < 1) throw new Error(errorMessages.CALL_VALUE)
  return getFibonacciMsSequence(calls - 1)
}
