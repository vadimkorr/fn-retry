import { fnRetriable } from '../src/fn-retry/fn-retriable'
import { errorMessages } from '../src/config'

test('returns value returned by fn passed if called without an error', async () => {
  const fn = a => a + 5
  const fnWithRetry = fnRetriable(fn)
  const actualValue = await fnWithRetry(10)
  expect(actualValue).toBe(15)
})

test('can be called multiple times', async () => {
  const callTimes = 2
  const retries = 3
  function* waiter() {
    for (let i = 0; i < retries; i++) {
      yield 100
    }
  }
  let calls = 0
  const fn = () => {
    calls++
    throw 'Error'
  }

  const fnWithRetry = fnRetriable(fn, {
    waiter,
  })
  for (let i = 0; i < callTimes; i++) {
    await fnWithRetry()
  }
  expect(calls).toBe(callTimes + callTimes * retries)
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
  const fnWithRetry = fnRetriable(fn, {
    delays: [100, 100],
  })
  const actualValue = await fnWithRetry(10)
  expect(actualValue).toBe(15)
})

test('returns default value if max calls exceeded', async () => {
  const defaultValue = 5
  const fn = () => {
    throw new Error('error')
  }
  const fnWithRetry = fnRetriable(fn, {
    delays: [100, 100],
    onMaxCallsExceeded: () => defaultValue,
  })
  const actualValue = await fnWithRetry()
  expect(actualValue).toBe(defaultValue)
})

test('throws an error if wrong fn is passed', () => {
  expect(async () => {
    fnRetriable('fn')
  }).rejects.toEqual(new Error(errorMessages.FN_TYPE))
})
