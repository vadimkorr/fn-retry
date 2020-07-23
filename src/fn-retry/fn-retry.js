import { wait } from '../../src/fn-retry/wait'
import { addOne } from '../../src/utils/add'
import { get } from '../../src/utils/get'
import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'
import { errorMessages } from '../../src/config'

const defaultFn = () => null

export async function fnRetry(fn, options) {
  if (typeof fn !== 'function') throw new Error(errorMessages.FN_TYPE)

  const _onCallError = get(options, 'onCallError', defaultFn)
  const _onMaxCallsExceeded = get(options, 'onMaxCallsExceeded', defaultFn)
  const _delays = get(options, 'delays', [])
  const _waiter = get(options, 'waiter', null)

  let call = 0
  while (_waiter || call <= _delays.length) {
    try {
      return await fn()
    } catch (error) {
      _onCallError({
        error,
        call: addOne(call),
        maxCalls: getMaxCallsCount(_delays),
      })
      if (call < _delays.length) {
        await wait(_waiter ? _waiter.next() : _delays[call])
      }
    } finally {
      call++
    }
  }
  return _onMaxCallsExceeded()
}
