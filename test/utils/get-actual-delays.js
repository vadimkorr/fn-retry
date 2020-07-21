export const getActualDelays = timestampsMs =>
  timestampsMs.reduce(
    (acc, curr, index, _timestampsMs) => [
      ...acc,
      ...((index < _timestampsMs.length - 1 && [
        _timestampsMs[index + 1] - curr,
      ]) ||
        []),
    ],
    []
  )
