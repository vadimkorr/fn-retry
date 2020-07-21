export const get = (object, field, defaultValue) => {
  if (object && object.hasOwnProperty(field)) {
    return object[field]
  }
  return defaultValue
}
