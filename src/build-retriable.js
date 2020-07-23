import { errorMessages } from '../src/config'

export const buildRetriable = retrier => (fn, options) => {
  if (typeof fn !== 'function') throw new Error(errorMessages.FN_TYPE)
  return (...args) => retrier(fn.bind(null, ...args), options)
}
