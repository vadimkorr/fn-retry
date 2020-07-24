export const getValuesFromGenerator = generator => {
  const iterator = generator()
  const values = []
  while (true) {
    let result = iterator.next()
    if (result.done) {
      break
    }
    values.push(result.value)
  }
  return values
}
