module.exports = function (env) {
  // if you need accss to the internal nunjucks filter you can just env
  // see the example below for 'safe' which is used in 'filters.log'
  var nunjucksSafe = env.getFilter('safe')

  /**
   * object used store the methods registered as a 'filter' (of the same name) within nunjucks
   * filters.foo("input") here, becomes {{ "input" | foo }} within nunjucks templates
   * @type {Object}
   */
  var filters = {}

  /**
   * logs an object in the template to the console on the client.
   * @param  {Any} a any type
   * @return {String}   a script tag with a console.log call.
   * @example {{ "hello world" | log }}
   * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
   */
  filters.log = function log (a) {
    return nunjucksSafe('<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>')
  }

  return filters
}
