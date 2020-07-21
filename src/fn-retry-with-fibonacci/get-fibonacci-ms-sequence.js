import { getFibonacciSequence } from '../../src/fn-retry-with-fibonacci/get-fibonacci-sequence'
import { secToMs } from '../../src/utils/convert'

export const getFibonacciMsSequence = len =>
  getFibonacciSequence(len).map(secToMs)
