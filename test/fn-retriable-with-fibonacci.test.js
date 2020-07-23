import { fnRetriableWithFibonacci } from '../src/fn-retry-with-fibonacci'
import { getFibonacciMsSequenceByCalls } from '../src/fn-retry-with-fibonacci/get-fibonacci-ms-sequence'
import { anyDelayFulfilled } from '../test/utils/any-delay-fulfilled'
import { getExecTimeMs } from '../test/utils/get-exec-time-ms'
import { getTestObject } from '../test/utils/get-test-object'
import { errorMessages } from '../src/config'

export const testDelay = async ({
  calls,
  delays,
  failedCallsMap,
  expectedIsMaxCallsExceeded,
}) => {
  const {
    getFn,
    getStats,
    handleCallError,
    handleMaxCallsExceeded,
  } = getTestObject(delays, failedCallsMap)
  const fn = getFn()
  const fnWithRetry = fnRetriableWithFibonacci(fn, {
    calls,
    onCallError: handleCallError,
    onMaxCallsExceeded: handleMaxCallsExceeded,
  })
  const execTime = await getExecTimeMs(fnWithRetry)
  const { actual, expected } = getStats()
  expect(actual.callsCount).toBe(expected.callsCount)
  expect(execTime).toBeWithinRangeEps(expected.waitingTimeMs)
  expect(anyDelayFulfilled(actual.delays, delays)).toBe(true)
  expect(actual.isMaxCallsExceeded).toBe(expectedIsMaxCallsExceeded)
  expect(actual.errorCallsCount).toBe(expected.errorCallsCount)
}

test('calls specified amount of times if fn is failed', async () => {
  const calls = 2
  const delays = getFibonacciMsSequenceByCalls(calls)
  await testDelay({
    delays,
    calls,
    failedCallsMap: [true, true],
    expectedIsMaxCallsExceeded: true,
  })
})

test("doesn't retry if first call is successfull", async () => {
  const calls = 2
  const delays = getFibonacciMsSequenceByCalls(calls)
  await testDelay({
    delays,
    calls,
    failedCallsMap: [false, false],
    expectedIsMaxCallsExceeded: false,
  })
})

test('calls one time if second call is successfull', async () => {
  const calls = 3
  const delays = getFibonacciMsSequenceByCalls(calls)
  await testDelay({
    delays,
    calls,
    failedCallsMap: [true, false, false],
    expectedIsMaxCallsExceeded: false,
  })
})

test("doesn't retry if delays is empty (calls only ones)", async () => {
  const calls = 1
  const delays = getFibonacciMsSequenceByCalls(calls)
  await testDelay({
    delays,
    calls,
    failedCallsMap: [false],
    expectedIsMaxCallsExceeded: false,
  })
})

test("doesn't retry if delays is empty, but call is failed", async () => {
  const calls = 1
  const delays = getFibonacciMsSequenceByCalls(calls)
  await testDelay({
    delays,
    calls,
    failedCallsMap: [true],
    expectedIsMaxCallsExceeded: true,
  })
})

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
