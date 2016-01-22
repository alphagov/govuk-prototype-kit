/**
 * filter items
 * Add your filters to the fi obj as methods. See examples below.
 * "fi" being short allowing tidier composition
 */
var fi = {};

/**
 * logs an object in the template to the console on the client.
 * @param  {Any} a any type
 * @return {String}   a script tag with a console.log call.
 * @example {{ "hello world" | log }}
 * @example {{ "hello world" | log | safe }}  [for environments with autoescaping turned on]
 */
fi.log = function log(a) {
	return '<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>';
};

/**
 * Converts string to camel case
 * @param {String} any string
 * @return {String} a string
 * @example {{ "Hello There" | toCamelCase }} // helloThere
 */
fi.toCamelCase = function toCamelCase(s) {
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
fi.toHyphenated = function toHyphenated(s) {
	return s.trim().toLowerCase().replace(/\s+/g, '-');
};

/**
 * padZeros on a number
 * @param n {Number} value to be padded
 * @param l {Number} padding length
 * @example {{ 3 | padZeros(2) }} // 003
 */
fi.padZeros = function padZeros(n, l) {
	var t = l - String(n).length;
	return Array((t > -1 ? t : 0) + 1).join('0') + String(n);
};

exports.items = fi;
