export const getExecTimeMs = async fn => {
  const startExecTime = Date.now()
  await fn()
  const endExecTime = Date.now()
  return endExecTime - startExecTime
}
