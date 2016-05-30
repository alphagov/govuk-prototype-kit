module.exports = function(env) {

  // if you need accss to the internal nunjucks filter you can just env
  // see the example below for 'safe' which is used in 'filters.log'
  var nunjucksSafe = env.getFilter('safe');

  /**
   * object used store the methods registered as a 'filter' (of the same name) within nunjucks
   * filters.foo("input") here, becomes {{ "input" | foo }} within nunjucks templates
   * @type {Object}
   */
  var filters = {};

  /**
   * logs an object in the template to the console on the client.
   * @param  {Any} a any type
   * @return {String}   a script tag with a console.log call.
   * @example {{ "hello world" | log }}
   * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
   */
  filters.log = function log(a) {
  	return nunjucksSafe('<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>');
  };

  /**
   * turns a string into a slug that's safe for use in urls or html attributes
   * @param  {String} a string
   * @return {String} a web-safe slug
   */

  filters.slug = function slug(input){

    var output;

    try{
      output = input.toString();
    } catch (error){
      console.error(`core_filters.js couldn't make a slug from ${input}`);
      return;
    }
    output = output.toLowerCase();
    output = output.replace(/\s+/g,'-');
    output = output.replace(/[^\w-]/g,'');

    return output;
  }

  /**
   * converts string to camelCase for use as a variable name
   * @param  {String} a string
   * @return {String} string in camelCase
   */

  filters.camelCase = function slug(input){

    try{
      output = input.toString();
    } catch (error){
      console.error(`core_filters.js couldn't convert ${input} to camelCase`);
      return;
    }

    output = output.replace(/\s(.)/g, function($1) {
      return $1.toUpperCase();
    });
    output = output.replace(/\s/g, '');
    output = output.replace(/^(.)/, function($1) {
      return $1.toLowerCase();
    });

    output = output.replace(/\W/g,'');

    return output;

  }

  return filters;
}