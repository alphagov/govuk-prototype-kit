// local dependencies
const { runWhenEnvIsAvailable, external } = require('./api')
const { addFilter, getFilter } = external

runWhenEnvIsAvailable(() => {
  const nunjucksSafe = getFilter('safe')

  addFilter(
    'log',
    /**
     * Logs an object in the template to the console in the browser.
     *
     * @example {{ "hello world" | log }}
     * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
     * @param  {any} a - any type
     * @returns {string} a script tag with a console.log call.
     */
    (a) => nunjucksSafe('<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>')
  )

  addFilter(
    'formatItems',
    /**
     * Returns an array of objects for use in a macro that requires a list of items
     *
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
     * @param  {string[]} items - an array of strings.
     * @returns {{ text: string, value: string }[]} an array of objects with text and value properties.
     */
    (items = []) => Array.isArray(items)
      ? items.map((item) => ({ text: item, value: item }))
      : []
  )
})
