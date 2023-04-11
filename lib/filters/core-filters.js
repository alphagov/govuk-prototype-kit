import { views } from "../../index.js";
// local dependencies
const { addFilter, getFilter } = { views }.views;
const nunjucksSafe = getFilter('safe');
/**
 * Logs an object in the template to the console in the browser.
 * @param  {Any} a any type
 * @return {String} a script tag with a console.log call.
 * @example {{ "hello world" | log }}
 * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
 */
addFilter('log', a => nunjucksSafe('<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>'));
