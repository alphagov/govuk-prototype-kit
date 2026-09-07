// First-party helper for reading a value from an object using a keypath,
// replacing lodash's `get`. Supports the name formats used by the
// `checked` Nunjucks function:
//   "field-name"
//   "parent.field-name"
//   "['parent']['field-name']"

function parseKeypath (name) {
  if (!name.match(/[.[\]]/g)) {
    return [name]
  }
  // Match "['field-name']" segments and "field-name" dot-separated segments
  const keys = []
  const segmentMatcher = /(?:\['([^']*)'\])|(?:\.?([^[.]+))/g
  let match
  while ((match = segmentMatcher.exec(name)) !== null) {
    keys.push(match[1] !== undefined ? match[1] : match[2])
  }
  return keys
}

function getKeypath (obj, name) {
  return parseKeypath(name).reduce((value, key) => {
    if (value === undefined || value === null) {
      return undefined
    }
    return value[key]
  }, obj)
}

module.exports = {
  getKeypath
}
