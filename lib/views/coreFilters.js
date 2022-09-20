const { get: getKeypath } = require('lodash')
const { getConfig } = require('../config')
const { addFilter, addGlobal } = require('./api').external

/**
 * Logs an object in the template to the console in the browser.
 * @param  {Any} a any type
 * @return {String} a script tag with a console.log call.
 * @example {{ "hello world" | log }}
 * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
 */
addFilter('log', a => '<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>', {
  renderAsHtml: true
})

if (getConfig().useAutoStoreData) {
  addGlobal('checked', function (name, value) {
    // Check data exists
    if (this.ctx.data === undefined) {
      return ''
    }

    // Use string keys or object notation to support:
    // checked("field-name")
    // checked("['field-name']")
    // checked("['parent']['field-name']")
    name = !name.match(/[.[]/g) ? `['${name}']` : name
    var storedValue = getKeypath(this.ctx.data, name)

    // Check the requested data exists
    if (storedValue === undefined) {
      return ''
    }

    var checked = ''

    // If data is an array, check it exists in the array
    if (Array.isArray(storedValue)) {
      if (storedValue.indexOf(value) !== -1) {
        checked = 'checked'
      }
    } else {
      // The data is just a simple value, check it matches
      if (storedValue === value) {
        checked = 'checked'
      }
    }
    return checked
  })
}
