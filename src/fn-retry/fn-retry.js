import { wait } from '../../src/fn-retry/wait'
import { get } from '../../src/utils/get'
import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'
import { errorMessages, defaultFn } from '../../src/config'

const getIterationData = ({ delays, waiter, iterator, call }) =>
  waiter
    ? iterator.next()
    : {
        value: delays[call],
        done: call >= delays.length,
      }

export const fnRetry = async (fn, options) => {
  if (typeof fn !== 'function') throw new Error(errorMessages.FN_TYPE)

  const _onCallError = get(options, 'onCallError', defaultFn)
  const _onMaxCallsExceeded = get(options, 'onMaxCallsExceeded', defaultFn)
  const _delays = get(options, 'delays', [])
  const _waiter = get(options, 'waiter', null)

  const iterator = _waiter && _waiter()
  let _done = false
  let call = 0

  while (!_done) {
    try {
      return await fn()
    } catch (error) {
      const shouldStopRetries = _onCallError({
        error,
        call: call + 1, // as call starts from 0, show user friendly value
        ...(_waiter ? {} : { maxCalls: getMaxCallsCount(_delays) }),
      })
      if (shouldStopRetries === true) {
        break
      }
      const { value, done } = getIterationData({
        waiter: _waiter,
        delays: _delays,
        call,
        iterator,
      })
      value && (await wait(value))
      _done = done
      call++
    }
  }
  return _onMaxCallsExceeded()
}
