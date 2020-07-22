import { wait } from '../../src/fn-retry/wait'
import { addOne } from '../../src/utils/add'
import { get } from '../../src/utils/get'
import { getMaxCallsCount } from '../../src/fn-retry/get-max-calls-count'

const defaultFn = () => null

export async function fnRetry(fn, options) {
  if (typeof fn !== 'function') throw new Error('Incorrect value for fn')

  const _onCallError = get(options, 'onCallError', defaultFn)
  const _onMaxCallsExceeded = get(options, 'onMaxCallsExceeded', defaultFn)
  const _delays = get(options, 'delays', [])

  for (let call = 0; call <= _delays.length; call++) {
    try {
      return await fn()
    } catch (error) {
      _onCallError({
        error,
        call: addOne(call),
        maxCalls: getMaxCallsCount(_delays),
      })
      if (call < _delays.length) {
        await wait(_delays[call])
      }
    }
  }
  return _onMaxCallsExceeded()
}
