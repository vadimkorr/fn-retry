import { wait } from '../../src/fn-retry/wait'
import { addOne } from '../../src/utils/add'
import { get } from '../../src/utils/get'
import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'
import { errorMessages, defaultFn } from '../../src/config'

const getWaiterValue = waiter => {
  if (!waiter) return null
  const state = waiter.next()
  return state.done ? null : state.value
}

export async function fnRetry(fn, options) {
  if (typeof fn !== 'function') throw new Error(errorMessages.FN_TYPE)

  const _onCallError = get(options, 'onCallError', defaultFn)
  const _onMaxCallsExceeded = get(options, 'onMaxCallsExceeded', defaultFn)
  const _delays = get(options, 'delays', [])
  const _waiter = get(options, 'waiter', null)

  if (_waiter) {
    let waiterValue = true
    let call = 1
    while (waiterValue) {
      try {
        return await fn()
      } catch (error) {
        _onCallError({
          error,
          call,
        })
        waiterValue = getWaiterValue(_waiter)
        waiterValue && (await wait(waiterValue))
      } finally {
        call++
      }
    }
  } else {
    let call = 0
    while (call <= _delays.length) {
      try {
        return await fn()
      } catch (error) {
        _onCallError({
          error,
          call: addOne(call),
          maxCalls: getMaxCallsCount(_delays),
        })
        call < _delays.length && (await wait(_delays[call]))
      } finally {
        call++
      }
    }
  }
  return _onMaxCallsExceeded()
}
