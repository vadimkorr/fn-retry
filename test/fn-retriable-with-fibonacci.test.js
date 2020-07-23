import { fnRetriableWithFibonacci } from '../src/fn-retry-with-fibonacci'
import { errorMessages } from '../src/config'

test('returns value returned by fn passed if called without an error', async () => {
  const fn = a => a + 5
  const fnWithRetry = fnRetriableWithFibonacci(fn)
  const actualValue = await fnWithRetry(10)
  expect(actualValue).toBe(15)
})

test('returns value returned by fn passed after number of calls', async () => {
  let calledTimesCount = 0
  const fn = a => {
    if (calledTimesCount < 2) {
      calledTimesCount++
      throw new Error('error')
    } else {
      calledTimesCount++
      return a + 5
    }
  }
  const fnWithRetry = fnRetriableWithFibonacci(fn, {
    calls: 3,
  })
  const actualValue = await fnWithRetry(10)
  expect(actualValue).toBe(15)
})

test('returns default value if max calls exceeded', async () => {
  const defaultValue = 5
  const fn = () => {
    throw new Error('error')
  }
  const fnWithRetry = fnRetriableWithFibonacci(fn, {
    calls: 3,
    onMaxCallsExceeded: () => defaultValue,
  })
  const actualValue = await fnWithRetry()
  expect(actualValue).toBe(defaultValue)
})

test('throws an error if wrong fn is passed', () => {
  expect(async () => {
    fnRetriableWithFibonacci('fn')
  }).rejects.toEqual(new Error(errorMessages.FN_TYPE))
})
