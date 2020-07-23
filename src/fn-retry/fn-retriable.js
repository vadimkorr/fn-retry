import { fnRetry } from '../../src/fn-retry'
import { buildRetriable } from '../../src/build-retriable'

export const fnRetriable = buildRetriable(fnRetry)
