export const get = (object, field, defaultValue) =>
  (object && object[field]) || defaultValue
