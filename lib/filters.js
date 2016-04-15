var moment = require('moment');

/**
 * object used store the methods registered as a 'filter' (of the same name) within nunjucks
 * filter.foo("input") here, becomes {{ "input" | foo }} within nunjucks templates
 * @type {Object}
 */
var filter = {};

/**
 * creates rearranges values and creates new date object
 * @param  {String} d   A date string (must be) formatted (d)d/(m)m/yyy - in parens means optional
 * @return {String}     a javascript date string
 */
filter.newDate = function date(d) {
	var dateArr = d.split('/');
	return dateArr.length === 3 ? new Date(dateArr[2], parseInt(dateArr[1]) - 1, dateArr[0]) : NaN;
};

/**
 * returns a standard gov.uk date from a string using momentjs
 * moment documentation: http://momentjs.com/docs/
 * @method function
 * @param  {string} d date e.g 09/12/1981 or 9-12-1981
 * @param  {string} f moment.js format string (to override the default if needed)
 * @return {string} date string as per the current gov.uk standard 09/12/1981 -> 09 December 1981
 */
filter.formatDate = function(d,f) {
  return moment(filter.newDate(d)).locale('en-gb').format(f ? f : 'LL');
};

/**
 * logs an object in the template to the console on the client.
 * @param  {Any} a any type
 * @return {String}   a script tag with a console.log call.
 * @example {{ "hello world" | log }}
 * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
 */
filter.log = function log(a) {
	return '<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>';
};

/**
 * Converts string to camel case
 * @param {String} any string
 * @return {String} a string
 * @example {{ "Hello There" | toCamelCase }} // helloThere
 */
filter.toCamelCase = function toCamelCase(s) {
	return s.trim().split(/-| /).reduce(function (pw, cw, i) {
		return pw += (i === 0 ? cw[0].toLowerCase() : cw[0].toUpperCase()) + cw.slice(1);
	}, '');
};

/**
 * Hypthenates a string
 * @param {String} string to be converted
 * @return {String}
 * @example {{ "Hello there" | toHyphenated }} // hello-there
 */
filter.toHyphenated = function toHyphenated(s) {
	return s.trim().toLowerCase().replace(/\s+/g, '-');
};

module.exports = filter;
