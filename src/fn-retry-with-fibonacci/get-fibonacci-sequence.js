export const getFibonacciSequence = len => {
  const sequenceFn = {
    0: () => [],
    1: () => [1],
    2: () => [1, 1],
    rest: len => {
      const sequence = [1, 1]
      for (let i = 2; i < len; i++) {
        sequence[i] = sequence[i - 1] + sequence[i - 2]
      }
      return sequence
    },
  }
  return sequenceFn[len <= 2 ? len : 'rest'](len)
}
