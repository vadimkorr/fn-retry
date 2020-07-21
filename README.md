# fn-retry

Retry failed function call

[![npm](https://img.shields.io/npm/v/fn-retry.svg)](https://www.npmjs.com/package/fn-retry) [![npm](https://img.shields.io/npm/dm/fn-retry.svg)](https://www.npmjs.com/package/fn-retry)
<br />
[![GitHub repo](https://img.shields.io/badge/github-repo-green.svg?style=flat)](https://github.com/vadimkorr/fn-retry) [![GitHub followers](https://img.shields.io/github/followers/vadimkorr.svg?style=social&label=Follow)](https://github.com/vadimkorr)
<br />
[![npm](https://img.shields.io/npm/l/fn-retry.svg)](https://www.npmjs.com/package/fn-retry)
<br />

## Installation

```bash
npm install fn-retry
yarn add fn-retry
```

## Usage

### ES6

```js
import { fnRetry } from 'fn-retry'

const fn = async () => 'Hello'
const result = await fnRetry(fn, {
  delays: [100, 200, 300], // in case of error fn will be called 4 times, with specified delays between calls
})
```

### CommonJS

```js
const { fnRetry } = require('fn-retry')

const fn = async () => 'Hello'
const result = await fnRetry(fn, {
  delays: [100, 200, 300], // in case of error fn will be called 4 times, with specified delays between calls
})
```

## API

```js
fnRetry(fn: Function, options: Object) => Promise
```

### fn

Function that should be retried in case of errors

### options

| Name               | type       | Default      | Description                                                                                                                                      |
| ------------------ | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| delays             | `Array`    | `[]`         | Represents delays between failed calls, e.g. `[100, 200, 300]` - in case of error fn will be called 4 times, with specified delays between calls |
| onCallError        | `Function` | `() => null` | Called on failed try with objects as an argument `{ error: Error, try: number, maxCalls: number }`                                               |
| onMaxCallsExceeded | `Function` | `() => null` | Called when max number of calls is exceeded                                                                                                      |

## Testing

Clone the repository and execute:

```bash
yarn test
```
