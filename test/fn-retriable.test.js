import { fnRetriable } from '../src/fn-retry'
import { anyDelayFulfilled } from '../test/utils/any-delay-fulfilled'
import { getExecTimeMs } from '../test/utils/get-exec-time-ms'
import { getTestObject } from '../test/utils/get-test-object'
import { errorMessages } from '../src/config'

export const testDelay = async ({
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
  const fnWithRetry = fnRetriable(fn, {
    delays,
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
  await testDelay({
    delays: [100],
    failedCallsMap: [true, true],
    expectedIsMaxCallsExceeded: true,
  })
})

test("doesn't retry if first call is successfull", async () => {
  await testDelay({
    delays: [100],
    failedCallsMap: [false, false],
    expectedIsMaxCallsExceeded: false,
  })
})

test('calls one time if second call is successfull', async () => {
  await testDelay({
    delays: [100, 100],
    failedCallsMap: [true, false, false],
    expectedIsMaxCallsExceeded: false,
  })
})

test("doesn't retry if delays is empty (calls only ones)", async () => {
  await testDelay({
    delays: [],
    failedCallsMap: [false],
    expectedIsMaxCallsExceeded: false,
  })
})

test("doesn't retry if delays is empty, but call is failed", async () => {
  await testDelay({
    delays: [],
    failedCallsMap: [true],
    expectedIsMaxCallsExceeded: true,
  })
})

test('returns value returned by fn passed if called without an error', async () => {
  const fn = a => a + 5
  const fnWithRetry = fnRetriable(fn)
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
