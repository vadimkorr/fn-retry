import { fnRetryWithFibonacci } from '../../src/fn-retry-with-fibonacci/fn-retry-with-fibonacci'
import { buildRetriable } from '../../src/build-retriable'

export const fnRetriableWithFibonacci = buildRetriable(fnRetryWithFibonacci)
