import { get } from '../src/utils/get'

test('returns value if it is presented', () => {
  const value = get({ a: 5 }, 'a', 100)
  expect(value).toBe(5)
})

test('returns default value if field is not presented', () => {
  const value = get({}, 'a', 100)
  expect(value).toBe(100)
})

test('returns value if it presented, but has falsy value (0)', () => {
  const value = get({ a: 0 }, 'a', 0)
  expect(value).toBe(0)
})
