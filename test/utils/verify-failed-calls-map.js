import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'

export const verifyFailedCallsMap = (failedCallsMap, delays) => {
  if (failedCallsMap.length !== getMaxCallsCount(delays)) {
    throw new Error('failedCallsMap should be eq to delays.length + 1')
  }
  if (
    failedCallsMap.some((c, index) => {
      return index <= failedCallsMap.length - 2 && !c && failedCallsMap[index]
    })
  ) {
    throw new Error("false -> true transition doesn't make sense")
  }

  return failedCallsMap
}
