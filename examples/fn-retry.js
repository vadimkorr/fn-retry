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
        console.log(`Call ${call} of ${maxCalls}: ${error}`),
      onMaxCallsExceeded: () => console.log('max calls exceeded'),
    }
  )

  console.log('=====> fnRetriable')
  // fn
  const greet = ({ name }) => `Hello, ${name}!`
  // wrap fn to make it retriable
  const greetWithRetry = fnRetriable(greet, { delays: [1000] })
  // call retriable version of fn
  const greeting = await greetWithRetry({ name: 'World' })
  console.log(greeting)
}

module.exports = {
  main,
}
