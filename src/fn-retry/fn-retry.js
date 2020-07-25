import { wait } from '../../src/fn-retry/wait'
import { get } from '../../src/utils/get'
import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'
import { errorMessages, defaultFn } from '../../src/config'

export const fnRetry = async (fn, options) => {
  if (typeof fn !== 'function') throw new Error(errorMessages.FN_TYPE)

  const _onCallError = get(options, 'onCallError', defaultFn)
  const _onMaxCallsExceeded = get(options, 'onMaxCallsExceeded', defaultFn)
  const _delays = get(options, 'delays', [])
  const _waiter = get(options, 'waiter', null)

  let iterator = _waiter && _waiter()
  let iteratorDone = false
  let call = 0

  const getWaitMs = () => {
    if (_waiter) {
      const { done, value } = iterator.next()
      iteratorDone = done
      return value
    }
    return call < _delays.length ? _delays[call] : 0
  }

  while (_waiter ? !iteratorDone : call <= _delays.length) {
    try {
      return await fn()
    } catch (error) {
      _onCallError({
        error,
        call: call + 1, // as call starts from 0, show user friendly value
        ...(_waiter ? {} : { maxCalls: getMaxCallsCount(_delays) }),
      })
      const waitMs = getWaitMs()
      waitMs && (await wait(waitMs))
      call++
    }
  }
  return _onMaxCallsExceeded()
}
