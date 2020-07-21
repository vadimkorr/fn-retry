import { isWithinRangeEps } from '../../test/utils/is-within-range'
import { EPS_MS } from '../../test/config'

function toBeWithinRangeEps(received, value) {
  return (
    (isWithinRangeEps(received, value, EPS_MS) && {
      message: () =>
        `expected ${received} not to be within range ${value} +/- ${EPS_MS}`,
      pass: true,
    }) || {
      message: () =>
        `expected ${received} to be within range ${value} +/- ${EPS_MS}`,
      pass: false,
    }
  )
}

expect.extend({
  toBeWithinRangeEps,
})
