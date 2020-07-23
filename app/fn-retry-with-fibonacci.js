const { fnRetryWithFibonacci, fnRetriableWithFibonacci } = require('../dist')

const main = async () => {
  console.log('===== fnRetryWithFibonacci =====')
  const result = await fnRetryWithFibonacci(
    () => {
      console.log('fn called')
      return 5
    },
    {
      calls: 1,
    }
  )
  console.log(result)

  console.log('===== fnRetryWithFibonacci =====')
  await fnRetryWithFibonacci(
    async () => {
      throw new Error('error')
    },
    {
      calls: 2,
      onCallError: ({ error, call, maxCalls }) =>
        console.log(`Call ${call}/${maxCalls}: ${error}`),
      onMaxCallsExceeded: () => console.log('max calls exceeded'),
    }
  )

  console.log('===== fnRetriableWithFibonacci =====')
  // fn
  const greet = async name => await `Hello, ${name}!`
  // wrap fn to make it retriable
  const greetWithRetry = fnRetriableWithFibonacci(greet, { calls: 2 })
  // call retriable version of fn
  const greeting = await greetWithRetry('World')
  console.log(greeting)
}

main()
