// local dependencies
const { runWhenEnvIsAvailable, external } = require('./api')
const { addFilter, getFilter } = external

runWhenEnvIsAvailable(() => {
  const nunjucksSafe = getFilter('safe')

  /**
   * Logs an object in the template to the console in the browser.
   * @param  {Any} a any type
   * @return {String} a script tag with a console.log call.
   * @example {{ "hello world" | log }}
   * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
   */
  addFilter('log', a => nunjucksSafe('<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>'))

  /**
   * Returns an array of objects for use in a macro that requires a list of items
   * @param  {string[]} items - an array of strings.
   * @return {Object[]} an array of objects with each object containing text and value properties.
   * @example
   * ```njk
   * {{ govukCheckboxes({
   *   name: "waste",
   *   fieldset: {
   *     legend: {
   *       text: "Which types of waste do you transport?",
   *       isPageHeading: true,
   *       classes: "govuk-fieldset__legend--l"
   *     }
   *   },
   *   hint: {
   *     text: "Select all that apply."
   *   },
   *   items: ["Rubble", "Oil", "Card"] | formatItems
   * }) }}
   * ```
   */
  addFilter('formatItems', (items = []) => Array.isArray(items) ? items.map(item => ({ text: item, value: item })) : [])
})
