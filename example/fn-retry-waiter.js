const { fnRetry, fnRetriable } = require('../dist')

function* waiterWithMaxRetries(retries) {
  let waitMs = 100
  for (let i = 0; i < retries; i++) {
    yield waitMs
    waitMs *= 2
  }
}

const main = async () => {
  // fnRetry, with generator, with max retries
  {
    console.log('=====> fnRetry (with generators, with max retries)')
    await fnRetry(
      () => fetch(), // fetch is not imported to trigger an error
      {
        waiter: waiterWithMaxRetries(5),
        onCallError: errorData => console.log(errorData),
      }
    )
  }

  // fnRetry, with generator, till-success strategy
  {
    console.log('=====> fnRetry (with generators, with no limits)')
    function* waiter() {
      let waitMs = 100
      while (true) {
        yield waitMs
        waitMs *= 2
      }
    }
    await fnRetry(
      () => fetch(), // fetch is not imported to trigger an error
      {
        waiter: waiter(),
        onCallError: ({ error }) => console.log(error),
      }
    )
  }

  // fnRetry, with custom iterator
  {
    console.log('=====> fnRetry (with custom iterator)')
    const delays = [100, 200, 300]
    function getDelays() {
      let nextIndex = 0
      return {
        next: () =>
          nextIndex < delays.length
            ? { value: delays[nextIndex++], done: false }
            : { done: true },
      }
    }
    await fnRetry(
      () => fetch(), // fetch is not imported to trigger an error
      {
        waiter: getDelays(),
        onCallError: ({ error }) => console.log(error),
      }
    )
  }

  // fnRetriable, with generator, with max retries
  {
    console.log('=====> fnRetriable (with generator, with max retries)')
    const getData = ({ id }) => fetch(id) // fetch is not imported to trigger an error
    // wrap fn to make it retriable
    const getDataWithRetry = fnRetriable(getData, {
      waiter: waiterWithMaxRetries(5),
      onCallError: ({ call, error }) => console.log(`Call ${call}: ${error}`),
      onMaxCallsExceeded: () => ({}),
    })
    // call retriable version of fn
    const data = await getDataWithRetry({ id: 1 })
    console.log(data)
  }
}

module.exports = {
  main,
}
