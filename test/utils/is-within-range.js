export const isWithinRange = (value, start, end) =>
  value >= start && value <= end

export const isWithinRangeEps = (value, compareWith, eps) =>
  isWithinRange(value, compareWith - eps, compareWith + eps)
