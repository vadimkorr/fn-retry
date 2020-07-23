const { fnRetry, fnRetriable } = require('../dist')

const main = async () => {
  console.log('=====> fnRetry')
  const result = await fnRetry(
    () => {
      console.log('fn called')
      return 5
    },
    {
      delays: [100],
    }
  )
  console.log(result)

  console.log('=====> fnRetry')
  await fnRetry(
    async () => {
      throw new Error('error')
    },
    {
      delays: [100],
      onCallError: ({ error, call, maxCalls }) =>
        console.log(`Call ${call}/${maxCalls}: ${error}`),
      onMaxCallsExceeded: () => console.log('max calls exceeded'),
    }
  )
}

module.exports = {
  main,
}
