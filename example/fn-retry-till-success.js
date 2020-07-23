const { fnRetry, fnRetriable } = require('../dist')

const main = async () => {
  {
    // calls fn till suceess, with max 5 retries
    console.log('=====> fnRetry (with generators, with max retries)')
    function* getWaiter() {
      const MAX_RETRIES = 5
      let call = 0
      let waitMs = 100
      while (call < MAX_RETRIES) {
        yield waitMs
        waitMs *= 2
        call++
      }
      return waitMs
    }
    await fnRetry(
      () => fetch(), // fetch is not imported to trigger an error
      {
        waiter: getWaiter(),
        onCallError: ({ error }) => console.log(error),
      }
    )
  }

  {
    // calls fn till suceess
    console.log('=====> fnRetry (with generators, with no limits)')
    function* getWaiter() {
      let waitMs = 100
      while (true) {
        yield waitMs
        waitMs *= 2
      }
    }
    await fnRetry(
      () => fetch(), // fetch is not imported to trigger an error
      {
        waiter: getWaiter(),
        onCallError: ({ error }) => console.log(error),
      }
    )
  }

  {
    console.log('=====> fnRetry (with iterator)')
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
}

module.exports = {
  main,
}
