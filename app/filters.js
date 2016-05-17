module.exports = function(env) {

  /**
   * Instantiate object used to store the methods registered as a
   * 'filter' (of the same name) within nunjucks. You can override
   * gov.uk core filters by creating filter methods of the same name.
   * @type {Object}
   */
  var filters = {};

  /* ------------------------------------------------------------------
    add your methods to the filter obj below this comment block:
    @example

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!';
    }

  ------------------------------------------------------------------ */

  

  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  return filters;

};
