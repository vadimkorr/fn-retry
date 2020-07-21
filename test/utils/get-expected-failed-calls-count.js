export const getExpectedFailedCallsCount = failedCallsMap => {
  for (let i = 0; i < failedCallsMap.length; i++) {
    if (!failedCallsMap[i]) {
      return i
    }
  }
  return failedCallsMap.length
}
