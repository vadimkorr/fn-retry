import { wait } from '../../src/fn-retry/wait'
import { get } from '../../src/utils/get'
import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'
import { errorMessages, defaultFn } from '../../src/config'

const getWaiterValue = waiter => {
  if (!waiter) return null
  const state = waiter.next()
  // { done: true, value: undefined } stops loop
  // { done: true, value: 100 } this kind of object is considered as last value
  return state.done && state.value === undefined ? null : state.value
}

export const fnRetry = async (fn, options) => {
  if (typeof fn !== 'function') throw new Error(errorMessages.FN_TYPE)

  const _onCallError = get(options, 'onCallError', defaultFn)
  const _onMaxCallsExceeded = get(options, 'onMaxCallsExceeded', defaultFn)
  const _delays = get(options, 'delays', [])
  const _waiter = get(options, 'waiter', null)

  let waiterValue = true
  let call = 0

  while (_waiter ? waiterValue !== null : call <= _delays.length) {
    try {
      return await fn()
    } catch (error) {
      _onCallError({
        error,
        call: call + 1, // as call starts from 0, show user friendly value
        ...(_waiter ? {} : { maxCalls: getMaxCallsCount(_delays) }),
      })
      waiterValue = getWaiterValue(_waiter)
      const waitMs = _waiter
        ? waiterValue
        : call < _delays.length
        ? _delays[call]
        : 0
      waitMs && (await wait(waitMs))
    } finally {
      call++
    }
  }
  return _onMaxCallsExceeded()
}
