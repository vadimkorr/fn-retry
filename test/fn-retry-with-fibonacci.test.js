import { getFibonacciMsSequence } from '../src/fn-retry-with-fibonacci/get-fibonacci-ms-sequence'
import { fnRetryWithFibonacci } from '../src/fn-retry-with-fibonacci'
import { anyDelayFulfilled } from '../test/utils/any-delay-fulfilled'
import { getExecTimeMs } from '../test/utils/get-exec-time-ms'
import { getTestObject } from '../test/utils/get-test-object'

export const testDelay = async ({
  retries,
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
  const execTime = await getExecTimeMs(() =>
    fnRetryWithFibonacci(fn, {
      retries,
      onCallError: handleCallError,
      onMaxCallsExceeded: handleMaxCallsExceeded,
    })
  )
  const { actual, expected } = getStats()
  expect(actual.callsCount).toBe(expected.callsCount)
  expect(execTime).toBeWithinRangeEps(expected.waitingTimeMs)
  expect(anyDelayFulfilled(actual.delays, delays)).toBe(true)
  expect(actual.isMaxCallsExceeded).toBe(expectedIsMaxCallsExceeded)
  expect(actual.errorCallsCount).toBe(expected.errorCallsCount)
}

test('retries specified amount of times if fn is failed', async () => {
  const retries = 1
  const delays = getFibonacciMsSequence(retries)
  await testDelay({
    delays,
    retries,
    failedCallsMap: [true, true],
    expectedIsMaxCallsExceeded: true,
  })
})

test("doesn't retry if first call is successfull", async () => {
  const retries = 1
  const delays = getFibonacciMsSequence(retries)
  await testDelay({
    delays,
    retries,
    failedCallsMap: [false, false],
    expectedIsMaxCallsExceeded: false,
  })
})

test('retries one time if second call is successfull', async () => {
  const retries = 2
  const delays = getFibonacciMsSequence(retries)
  await testDelay({
    delays,
    retries,
    failedCallsMap: [true, false, false],
    expectedIsMaxCallsExceeded: false,
  })
})

test("doesn't retry if delays is empty (calls only ones)", async () => {
  const retries = 0
  const delays = getFibonacciMsSequence(retries)
  await testDelay({
    delays,
    retries,
    failedCallsMap: [false],
    expectedIsMaxCallsExceeded: false,
  })
})

test("doesn't retry if delays is empty, but call is failed", async () => {
  const retries = 0
  const delays = getFibonacciMsSequence(retries)
  await testDelay({
    delays,
    retries,
    failedCallsMap: [true],
    expectedIsMaxCallsExceeded: true,
  })
})

test('returns value returned by fn passed if called without', async () => {
  const expectedValue = 5
  const fn = async () => expectedValue
  const actualValue = await fnRetryWithFibonacci(fn, {
    retries: 0,
  })
  expect(actualValue).toBe(expectedValue)
})

test('returns value returned by fn passed after retries', async () => {
  const retries = 2
  let calledTimesCount = 0
  const expectedValue = 5
  const fn = async () => {
    if (calledTimesCount < retries) {
      calledTimesCount++
      throw 'error'
    } else {
      calledTimesCount++
      return expectedValue
    }
  }
  const actualValue = await fnRetryWithFibonacci(fn, {
    retries,
  })
  expect(actualValue).toBe(expectedValue)
})

test('throws an error if wrong fn is passed', () => {
  expect(async () => {
    await fnRetryWithFibonacci('fn')
  }).rejects.toEqual(new Error('Incorrect value for fn'))
})
