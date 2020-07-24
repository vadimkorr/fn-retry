export const getWaiter = delaysCount =>
  function* waiter() {
    if (delaysCount === 0) return
    let waitMs = 100
    for (let i = 0; i < delaysCount; i++) {
      yield waitMs
      waitMs *= 2
    }
  }
