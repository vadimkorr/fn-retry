import { getFibonacciSequence } from '../src/fn-retry-with-fibonacci/get-fibonacci-sequence'

test('returns correct sequence for length 0', () => {
  const sequence = getFibonacciSequence(0)
  expect(sequence).toEqual([])
})

test('returns correct sequence for length 1', () => {
  const sequence = getFibonacciSequence(1)
  expect(sequence).toEqual([1])
})

test('returns correct sequence for length 2', () => {
  const sequence = getFibonacciSequence(2)
  expect(sequence).toEqual([1, 1])
})

test('returns correct sequence for length 3', () => {
  const sequence = getFibonacciSequence(3)
  expect(sequence).toEqual([1, 1, 2])
})

test('returns correct sequence for length 5', () => {
  const sequence = getFibonacciSequence(5)
  expect(sequence).toEqual([1, 1, 2, 3, 5])
})
