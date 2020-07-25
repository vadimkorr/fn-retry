![fn-retry](https://pbs.twimg.com/media/EduUvk-XYAAQ7ag?format=png&name=large)

<div align="center">
<strong>Retry failed function call.</strong>
<br />
<strong>Dependency-free, tiny (~1.5 kb gzipped) and powerfull.</strong>

<br />
<br />

[![npm](https://img.shields.io/npm/v/fn-retry.svg)](https://www.npmjs.com/package/fn-retry) [![npm](https://img.shields.io/npm/dm/fn-retry.svg)](https://www.npmjs.com/package/fn-retry)
<br />
[![GitHub repo](https://img.shields.io/badge/github-repo-green.svg?style=flat)](https://github.com/vadimkorr/fn-retry) [![GitHub followers](https://img.shields.io/github/followers/vadimkorr.svg?style=social&label=Follow)](https://github.com/vadimkorr)
<br />
[![Build Status](https://travis-ci.org/vadimkorr/fn-retry.svg?branch=master)](https://travis-ci.org/vadimkorr/fn-retry)
<br />

</div>

## Installation

```bash
npm install fn-retry
yarn add fn-retry
```

## Usage

### ES6

```js
import { fnRetry } from 'fn-retry'

// basic example
const fn = () => {
  // function that should be retried in case of errors
  return 'Hello'
}

fnRetry(fn, {
  delays: [100, 200, 300], // in case of error fn will be called 4 times, with specified delays between calls
}).then(result => console.log(result))
```

### CommonJS

```js
const { fnRetry } = require('fn-retry')

// basic example
const fn = () => {
  // function that should be retried in case of errors
  return 'Hello'
}

fnRetry(fn, {
  delays: [100, 200, 300], // in case of error fn will be called 4 times, with specified delays between calls
}).then(result => console.log(result))
```

[More examples](./example)

# API

## `fnRetry`

Base strategy with custom delays. Fn will be called at least one time. In case of errors it will wait specified amount of ms (delays array) before the next call.

```js
fnRetry(fn: Function, options: Object) => Promise
```

#### fn

Function that should be retried in case of errors

#### options

| Name               | Type        | Default      | Description                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ----------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| delays             | `Array`     | `[]`         | Represents delays (in ms) between failed calls, e.g. `[100, 200, 300]` - in case of error fn will be called 4 times, with specified delays between calls.                                                                                                                                                                                             |
| onCallError        | `Function`  | `() => null` | Called on failed fn call with object `{ error: Error, call: number, maxCalls: number }` as an argument . <br/>It can return optional should-stop-retries value. If returnes `true`, further retries will be stopped. It can be useful, e.g., in case of auth errors. The default value of the `fn` can be returned from `onMaxCallsExceeded` as well. |
| onMaxCallsExceeded | `Function`  | `() => null` | Called when max number of fn calls is exceeded. Default value can be returned here. It will be used as returned value of `fn` in case of max calls exceeded or in case of stopping further retries by `onCallError`.                                                                                                                                  |
| waiter             | `Generator` | `null`       | If passed, `delays` option will be ignored. Represents generator of delay values. Can be used for making till-success calls. In this case `maxCalls` is not passed from `onCallError` callback.                                                                                                                                                       |

### Example

```js
// Base example

const fn = () => {
  // some function that should be retried in case of errors
  return 'Hello'
}

const result = await fnRetry(fn, {
  delays: [100],
  onCallError: ({ error, call, maxCalls }) =>
    console.log(`Call ${call} of ${maxCalls}: ${error}`),
  onMaxCallsExceeded: () => console.log('max calls exceeded'),
})

// Example with generator, till-success strategy

const fn = () => {
  // ...
}

function* waiter() {
  let waitMs = 100
  while (true) {
    yield waitMs
    waitMs *= 2
  }
}
await fnRetry(fn, {
  waiter,
  onCallError: ({ error, call }) => console.log(`Call ${call}: ${error}`),
})

// Example with generator, custom delays

const fn = () => {
  // ...
}

// it is the same as passing delays: [ 100, 200, 400, 800, 600 ]
function* waiter() {
  let waitMs = 100
  for (let i = 0; i < 5; i++) {
    yield waitMs
    waitMs *= 2
  }
}
await fnRetry(fn, {
  waiter,
  onMaxCallsExceeded: () => ({}),
})
```

## `fnRetryWithFibonacci`

In case of errors it will wait according to Fibonacci sequence before the next call. Fn will be called at least one time, e.g.:\
with calls equal to 5: `call failed` -> `wait 1s` -> `call failed` -> `wait 1s` -> `call failed` -> `wait 2s` -> `call failed` -> `wait 3s` -> `call failed`

```js
fnRetryWithFibonacci(fn: Function, options: Object) => Promise
```

#### fn

Function that should be retried in case of errors

#### options

| Name               | Type       | Default      | Description                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| calls              | `number`   | `1`          | Max number of calls, e.g. if `calls` is equal to 2, then flow will look like: `call failed` -> `wait 1s` -> `call succeded`.                                                                                                                                                                                                                           |
| onCallError        | `Function` | `() => null` | Called on failed `fn` call with object `{ error: Error, call: number, maxCalls: number }` as an argument. <br/>It can return optional should-stop-retries value. If returnes `true`, further retries will be stopped. It can be useful, e.g., in case of auth errors. The default value of the `fn` can be returned from `onMaxCallsExceeded` as well. |
| onMaxCallsExceeded | `Function` | `() => null` | Called when max number of fn calls is exceeded. Default value can be returned here. It will be used as returned value of `fn` in case of max calls exceeded or in case of stopping further retries by `onCallError`.                                                                                                                                   |

### Example

```js
const fn = () => {
  // some function that should be retried in case of errors
  return 'Hello'
}

const result = await fnRetryWithFibonacci(fn, {
  calls: 2,
  onCallError: ({ error, call, maxCalls }) =>
    console.log(`Call ${call} of ${maxCalls}: ${error}`),
  onMaxCallsExceeded: () => console.log('max calls exceeded'),
})
```

## Higher-order functions: `fnRetriable`, `fnRetriableWithFibonacci`

You can use wrapper version of retry functions. They just wrap `fn` that needs to be retried in case of errors, and return retriable version of the `fn`. See `options` in corresponding APIs above.
This allows you to use retried version just like you use original `fn`.

```js
// function that should be retried in case of errors
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
```

# Testing

Clone the repository and execute:

```bash
yarn test
npm test
```
