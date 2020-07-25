const { fnRetry, fnRetriable } = require('../dist')
const fetch = require('node-fetch')

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

  console.log('=====> fnRetriable (using fetch)')
  const getPostById = ({ id }) =>
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(response =>
      response.json()
    )

  // wrap getPostById to make it retriable
  const getPostByIdWithRetry = fnRetriable(getPostById, {
    delays: [1000],
  })
  // call retriable version of getPostById
  const post = await getPostByIdWithRetry({ id: 1 })
  console.log(post)

  console.log('=====> fnRetriable with shouldStopRetries')
  const getPostById = ({ id }) =>
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(response =>
      response.json()
    )

  // wrap getPostById to make it retriable
  const getPostByIdWithRetry = fnRetriable(getPostById, {
    delays: [100, 200, 300, 400, 500],
    onCallError: ({ error }) => {
      console.log(`Call ${call}: ${error.message}`)
      // it should stop retries if auth error occured
      return error.message === 'Authorization failed'
    },
    onMaxCallsExceeded: () => ({}), // still can return default value
  })
  const post = await getPostByIdWithRetry({ id: 1 })
  console.log(post)
}

module.exports = {
  main,
}
