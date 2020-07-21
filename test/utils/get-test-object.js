import { getWaitingTime } from '../../test/utils/get-wating-time'
import { verifyFailedCallsMap } from '../../test/utils/verify-failed-calls-map'
import { getExpectedFailedCallsCount } from '../../test/utils/get-expected-failed-calls-count'
import { getActualDelays } from '../../test/utils/get-actual-delays'

const getExpectedCallCount = failedCallsMap => {
  const firstSuccesfullCallIndex = failedCallsMap.findIndex(c => !c)
  return firstSuccesfullCallIndex === -1
    ? failedCallsMap.length
    : failedCallsMap.findIndex(c => !c) + 1
}

export const getTestObject = (delays, failedCallsMap) => {
  try {
    verifyFailedCallsMap(failedCallsMap, delays)
  } catch (e) {
    throw e
  }

  let fnCalledTimes = 0
  let errorCallsCount = 0
  let isMaxCallsExceeded = false
  const timestampsMs = []
  const failedCallsCount = getExpectedFailedCallsCount(failedCallsMap)

  function call() {
    fnCalledTimes++
  }

  function callWithError() {
    fnCalledTimes++
    throw new Error('error')
  }

  return {
    handleCallError() {
      errorCallsCount++
    },
    handleMaxCallsExceeded() {
      isMaxCallsExceeded = true
    },
    getFn() {
      return () => {
        timestampsMs.push(Date.now())
        if (failedCallsMap[fnCalledTimes]) {
          callWithError()
        } else {
          call()
        }
      }
    },
    getStats() {
      return {
        actual: {
          callsCount: fnCalledTimes,
          delays: getActualDelays(timestampsMs),
          errorCallsCount,
          isMaxCallsExceeded,
        },
        expected: {
          callsCount: getExpectedCallCount(failedCallsMap),
          waitingTimeMs: getWaitingTime(delays, failedCallsMap),
          errorCallsCount: failedCallsCount,
        },
      }
    },
  }
}
