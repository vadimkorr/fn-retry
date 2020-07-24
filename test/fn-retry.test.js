import { fnRetry } from '../src/fn-retry/fn-retry'
import { anyDelayFulfilled } from '../test/utils/any-delay-fulfilled'
import { getExecTimeMs } from '../test/utils/get-exec-time-ms'
import { getTestObject } from '../test/utils/get-test-object'
import { errorMessages } from '../src/config'

const getValuesFromIterator = iterator => {
  const values = []
  while (true) {
    let result = iterator.next()
    if (result.done) {
      break
    }
    values.push(result.value)
  }
  return values
}

export const testDelay = async ({
  delays,
  failedCallsMap,
  expectedIsMaxCallsExceeded,
  waiter,
}) => {
  const _delays = waiter ? getValuesFromIterator(waiter()) : delays
  const {
    getFn,
    getStats,
    handleCallError,
    handleMaxCallsExceeded,
  } = getTestObject(_delays, failedCallsMap)
  const fn = getFn()
  const execTime = await getExecTimeMs(() =>
    fnRetry(fn, {
      delays,
      waiter,
      onCallError: handleCallError,
      onMaxCallsExceeded: handleMaxCallsExceeded,
    })
  )
  const { actual, expected } = getStats()
  expect(actual.callsCount).toBe(expected.callsCount)
  expect(execTime).toBeWithinRangeEps(expected.waitingTimeMs)
  expect(anyDelayFulfilled(actual.delays, _delays)).toBe(true)
  expect(actual.isMaxCallsExceeded).toBe(expectedIsMaxCallsExceeded)
  expect(actual.errorCallsCount).toBe(expected.errorCallsCount)
}

const getWaiter = delaysCount =>
  function* waiter() {
    if (delaysCount === 0) return
    let call = 0
    let waitMs = 100
    // one more delay is in return
    while (call < delaysCount) {
      yield waitMs
      waitMs *= 2
      call++
    }
  }

test('calls specified amount of times if fn is failed', async () => {
  const setup = {
    failedCallsMap: [true, true],
    expectedIsMaxCallsExceeded: true,
  }
  await testDelay({
    delays: [100],
    ...setup,
  })
  await testDelay({
    waiter: getWaiter(1),
    ...setup,
  })
})

test("doesn't retry if first call is successfull", async () => {
  const setup = {
    failedCallsMap: [false, false],
    expectedIsMaxCallsExceeded: false,
  }
  await testDelay({
    delays: [100],
    ...setup,
  })
  await testDelay({
    waiter: getWaiter(1),
    ...setup,
  })
})

test('calls one time if second call is successfull', async () => {
  const setup = {
    failedCallsMap: [true, false, false],
    expectedIsMaxCallsExceeded: false,
  }
  await testDelay({
    delays: [100, 100],
    ...setup,
  })
  await testDelay({
    waiter: getWaiter(2),
    ...setup,
  })
})

test("doesn't retry if delays is empty (calls only ones)", async () => {
  const setup = {
    failedCallsMap: [false],
    expectedIsMaxCallsExceeded: false,
  }
  await testDelay({
    delays: [],
    ...setup,
  })
  await testDelay({
    waiter: getWaiter(0),
    ...setup,
  })
})

test("doesn't retry if delays is empty, but call is failed", async () => {
  const setup = {
    failedCallsMap: [true],
    expectedIsMaxCallsExceeded: true,
  }
  await testDelay({
    delays: [],
    ...setup,
  })
  await testDelay({
    waiter: getWaiter(0),
    ...setup,
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

test('returns value returned by fn passed after number of calls', async () => {
  let calledTimesCount = 0
  const expectedValue = 5
  const fn = async () => {
    if (calledTimesCount < 2) {
      calledTimesCount++
      throw new Error('error')
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

test('returns default value if max calls exceeded', async () => {
  const defaultValue = 5
  const fn = async () => {
    throw new Error('error')
  }
  const actualValue = await fnRetry(fn, {
    delays: [100, 100],
    onMaxCallsExceeded: () => defaultValue,
  })
  expect(actualValue).toBe(defaultValue)
})

test('throws an error if wrong fn is passed', () => {
  expect(async () => {
    await fnRetry('fn')
  }).rejects.toEqual(new Error(errorMessages.FN_TYPE))
})
