export const getWaitingTime = (delays, failedCallsMap) => {
  let waitingTime = 0
  for (let i = 0; i < failedCallsMap.length; i++) {
    if (failedCallsMap[i]) {
      waitingTime += delays[i] || 0
    } else {
      break
    }
  }
  return waitingTime
}
