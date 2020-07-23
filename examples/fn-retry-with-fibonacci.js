const { fnRetryWithFibonacci, fnRetriableWithFibonacci } = require('../dist')

const main = async () => {
  console.log('=====> fnRetryWithFibonacci')
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

  console.log('=====> fnRetryWithFibonacci')
  await fnRetryWithFibonacci(
    async () => {
      throw new Error('error')
    },
    {
      calls: 2,
      onCallError: ({ error, call, maxCalls }) =>
        console.log(`Call ${call} of ${maxCalls}: ${error}`),
      onMaxCallsExceeded: () => console.log('max calls exceeded'),
    }
  )
}

module.exports = {
  main,
}
