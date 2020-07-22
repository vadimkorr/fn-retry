import { wait } from '../src/fn-retry/wait'
import { getExecTimeMs } from '../test/utils/get-exec-time-ms'

test('waits specified amount of ms', async () => {
  const WAIT_MS = 1500
  const execTime = await getExecTimeMs(() => wait(WAIT_MS))
  expect(execTime).toBeWithinRangeEps(WAIT_MS)
})
