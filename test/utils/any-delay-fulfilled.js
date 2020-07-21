import { isWithinRangeEps } from '../../test/utils/is-within-range'
import { EPS_MS } from '../../test/config'

export function anyDelayFulfilled(actualDelays, expectedDelays) {
  return expectedDelays
    .map(
      (delay, index) =>
        actualDelays[index] === undefined ||
        delay === undefined ||
        isWithinRangeEps(actualDelays[index], delay, EPS_MS)
    )
    .every(isWithin => isWithin)
}
