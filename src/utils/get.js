export const get = (object, field, defaultValue) =>
  object && object.hasOwnProperty(field) ? object[field] : defaultValue
