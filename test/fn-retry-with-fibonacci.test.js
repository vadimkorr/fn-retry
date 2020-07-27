import { getFibonacciMsSequenceByCalls } from '../src/fn-retry-with-fibonacci/get-fibonacci-ms-sequence'
import { fnRetryWithFibonacci } from '../src/fn-retry-with-fibonacci/fn-retry-with-fibonacci'
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
  const execTime = await getExecTimeMs(() =>
    fnRetryWithFibonacci(fn, {
      calls,
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

test('returns value returned by fn passed if called without', async () => {
  const expectedValue = 5
  const fn = async () => expectedValue
  const actualValue = await fnRetryWithFibonacci(fn, {
    calls: 1,
  })
  expect(actualValue).toBe(expectedValue)
})

test('returns value returned by fn passed after calls', async () => {
  const calls = 3
  let calledTimesCount = 0
  const expectedValue = 5
  const fn = async () => {
    if (calledTimesCount < calls - 1) {
      calledTimesCount++
      throw 'error'
    } else {
      calledTimesCount++
      return expectedValue
    }
  }
  const actualValue = await fnRetryWithFibonacci(fn, {
    calls,
  })
  expect(actualValue).toBe(expectedValue)
})

test('throws an error if wrong fn is passed', () => {
  expect(async () => {
    await fnRetryWithFibonacci('fn')
  }).rejects.toEqual(new Error(errorMessages.FN_TYPE))
})

test('returns default value if max calls exceeded', async () => {
  const defaultValue = 5
  const fn = async () => {
    throw new Error('error')
  }
  const actualValue = await fnRetryWithFibonacci(fn, {
    calls: 2,
    onMaxCallsExceeded: () => defaultValue,
  })
  expect(actualValue).toBe(defaultValue)
})

test('throws an error if calls is less than 1', () => {
  expect(async () => {
    await fnRetryWithFibonacci(() => {}, {
      calls: 0,
    })
  }).rejects.toEqual(new Error(errorMessages.CALL_VALUE))
})

test('throws an error if calls is not a number', () => {
  expect(async () => {
    await fnRetryWithFibonacci(() => {}, {
      calls: '1',
    })
  }).rejects.toEqual(new Error(errorMessages.CALL_TYPE))
})
