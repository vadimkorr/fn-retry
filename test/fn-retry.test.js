import { fnRetry } from '../src/fn-retry/fn-retry'
import { anyDelayFulfilled } from '../test/utils/any-delay-fulfilled'
import { getExecTimeMs } from '../test/utils/get-exec-time-ms'
import { getTestObject } from '../test/utils/get-test-object'

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
  const execTime = await getExecTimeMs(() =>
    fnRetry(fn, {
      delays,
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
  const expectedValue = 5
  const fn = async () => expectedValue
  const actualValue = await fnRetry(fn, {
    delays: [],
  })
  expect(actualValue).toBe(expectedValue)
})

test('returns value returned by function passed after calls', async () => {
  let calledTimesCount = 0
  const expectedValue = 5
  const fn = async () => {
    if (calledTimesCount < 2) {
      calledTimesCount++
      throw 'error'
    } else {
      calledTimesCount++
      return expectedValue
    }
  }
  const actualValue = await fnRetry(fn, {
    delays: [100, 100],
  })
  expect(actualValue).toBe(expectedValue)
})

test('throws an error if wrong fn is passed', () => {
  expect(async () => {
    await fnRetry('fn')
  }).rejects.toEqual(new Error('Incorrect value for fn'))
})
