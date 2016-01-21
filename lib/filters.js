_ = require('lodash');

var ctx, nunjucks;

_.mixin({
	not: function(fn, ctx) {
		return function() {
			return ! fn.apply(ctx || {}, [].slice.call(arguments));
		};
	},
	get: function(obj, sel, defaultValue) {
		if ( typeof sel !== 'string' ) {
			return obj;
		}
		return _.reduce([obj].concat(sel.split('.')), function(a, b) {
			return ( a && a[b] ) ? a[b] : undefined;
		}) || defaultValue;
	}
});

var fi = {};

/**
 * converts a parameter to a string
 * @param  {*} a a variable
 * @return {String}   The string value of the variable
 */
fi.s = fi.toString = function toString(a) {
	return typeof a.toString === 'function' ? a.toString() : '' + a;
};

/**
* checks if string contains passed substring
* @param {*} a variable - the string you want to test
* @param {String} the string you want to test for
* @return {Boolean} true if found else false
 */
fi.contains = function contains(a, s) {
	return a && s ? !!~a.indexOf(s) : false;
};

/**
* checks if string contains passed substring
* @param {*} a variable - the string you want to test
* @param {String} r the RegExp to test
* @return {Boolean} true if found else false
 */
fi.containsRegExp = function containsRegExp(a,r) {
	return new RegExp(r).test(a);
};

/**
 * ensure input is an array
 * @param  {*} i an item
 * @return {Array}   the item as an array
 */
fi.plural = function plural(i) {
	return Array.isArray(i) ? i : typeof i !== 'undefined' ? [i] : [];
};

/**
 * ensure input is not an array
 * @param  {*} a any variable
 * @return {*}   anything that isn't an array.
 */
fi.singular = function singular(a) {
	return _.isArray(a) ? a[0] : a;
};

/**
 * converts an array of objects or singular object to a list of pairs.
 * @param  {Array|Object} a  an array of objects or singular object
 * @param  {String} (optional) kp key property name, used if array of objects. defaults to 'key'
 * @param  {String} (optional) vp value property name, used if array of objects. defaults to 'value'
 * @return {Array}    array of key-value arrays
 */
fi.pairs = function pairs(a, kp, vp) {
	return _.isPlainObject(a) ? Object.keys(a).map(function(k) { return ! _.isEmpty(k) ? [k, a[k]] : '' }) :
				 _.isArray(a) ? a.map(function(b) { return _.isPlainObject(b) ? [ _.get(b, kp || 'key'), _.get(b, vp || 'value') ] : b }) :
				 a;
};

/**
 * maps pair values to object keys.
 * @param  {Array|Object} p  an array
 * @param  {String} (optional) k1 key 1 will point to first value in array
 * @param  {String} (optional) k2 key 2 will point to second value in array
 * @return {Object} 	object with two key/values
 */
fi.unpackPair = function unpackPair(p, k1, k2) {
	var o = {}; return ( o[k1] = p[0], o[k2] = p[1], o);
};

/**
 * prefixes each item in a list
 * @param  {*} is a list of items, or a single item.
 * @param  {String|Function} p  a string or function to prefix the first item with.
 * @return {Array}    a list of prefixed items.
 */
fi.prefix = function prefix(is, p) {
	return fi.plural(is).map(function(i, index) {
		return _.isFunction(p) ? p(i, index) : _.isArray(p) ? p[index] + i : p + i;
	});
};

/**
 * in a list of lists (is), prefixes a string (p) to the first item of the inner list
 * @param  {Array} is a list of lists
 * @param  {String|Function} p  a string or function to prefix the first item with
 * @return {Array}    a list of items with the first item of the inner item prefixed
 */
fi.prefixFirst = function prefixFirst(is, p) {
	return fi.plural(is).map(function(i) {
		return _.isArray(i) ? (i[0] = _.isFunction(p) ? p(i[0]) : i[0], i) : i;
	});
};

/**
 * postfixes each item in a list
 * @param  {*} is a list of items, or a single item.
 * @param  {String|Number} p  used to postfix item.
 * @return {Array}    a list of postfixed items.
 */
fi.postfix = function postfix(is, p) {
	return fi.plural(is).map(function(i) { return _.isArray(i) ? fi.postfix(i, p) : i + p });
};

/**
 * wrap a string or a list of strings in two strings.
 * @param  {Array|String} w the string or list of strings to wrap
 * @param  {String} b the before string
 * @param  {String} a the after string
 * @return {Array}   the wrapped item
 */
fi.wrap = function wrap(w,a,b) {
	return a + w + b;
};

/**
 * gets the css modifiers of a base class namfi.
 * @param  {String} b  base class name
 * @param  {Array|String} ms modifiers
 * @return {string}    modifiers
 */
fi.modifiers = function modifiers(b, ms) {
	return fi.plural(ms).map(function(m) { return b + '--' + m }).join(' ');
};

/**
 * prepends a base class with the modifiers of the base class.
 * @param  {String} b  base class
 * @param  {Array|String} ms modifiers
 * @return {String}    base class name and modifiers
 */
fi.withModifiers = function withModifiers(b, ms) {
	return [b].concat(fi.modifiers(b, ms) || []).join(' ');
};

/**
 * composes the classes for the component
 * @param  {String} b  base module class
 * @param  {Object} md the metadata object
 * @return {String}    component classes
 */
fi.componentClasses = function componentClasses(b, md) {
	return (md = md || {}, [fi.withModifiers(b, md.modifiers)].concat(md.classes || []).join(' '));
};

/**
 * takes a layout object and returns a layout string
 * @param  {Object} o layout object
 * @return {String}   layout string
 */
fi.layoutClasses = function layoutClasses(o) {
	return _.isPlainObject(o) ? Object.keys(o).map(function(k) { return ~['default', 'additional'].indexOf(k) ? o[k] : k + '--' + o[k] }).join(' ') : '';
};

fi.hashCode = function(s){
	if (!s) { return ""; }
	return s.split("").reduce(function (a, b) {
		a = ((a << 5) - a) + b.charCodeAt(0);
		return a & a;
	}, 0);
};

/**
 * logs an object in the template to the console on the client.
 * @param  {Any} a any type
 * @return {String}   a script tag with a consolfi.log call.
 */
fi.log = function log(a) {
	return '<script>console.log(' + JSON.stringify(a, null, '\t') + ')</script>';
};

/**
 * map over a list and transform items
 * @param  {Array} is list of items
 * @param  {Array|String} ps a list of properties to filter
 * @param  {String} rp root property to filter. Undefined by default
 * @return {Array}    lodash method to map with. 'pick' by default.
 */
fi.reduceTo = function reduceTo(is, ps, rp, m) {
	return _.map(is, function(i) {
		i = _[m || 'pick']( rp? i[rp] : i, ps );
		return _.filter(_.without(_.values(i), undefined), _.not(_.isEmpty)).length === ps.length ? i : {};
	});
};

/**
 * remove unwanted items from a list
 * @param  {Array} is a list of items
 * @param  {String} e  the thing to exclude
 * @param  {String} m  an override method. ('_.without' by default)
 * @return {Array}    a list without matched items
 */
fi.without = function without(is, e, m) {
	switch(e) {
		case "__empty__":
			e = _.not(_.isEmpty); m = 'filter';
	}

	return _[ m || 'without' ]( is , e );
};

/**
 * writes the context as the value of an attribute
 * @param  {String} v the attribute value
 * @param  {String} a attribute name
 * @return {String}
 */
fi.attr = function attr(v, a, p) {
	return (!_.isEmpty(v) ? (p || '') + a + '="' + v + '"' : '');
};

/**
 * takes a list of key-value lists and converts them to attribute format
 * @param  {Array} is list of key-value lists
 * @param  {String} (optional) p  prefix the attribute name
 * @return {Array} list of attributes
 */
fi.attrs = function attrs(is, p) {
	return fi.plural(is).map( function(i) { return _.isArray(i) ? fi.attr(i[1], i[0], p) : '' } );
};

/**
 * replaces a string with another string in an object of known conversions.
 * @param  {String} s the string to be transformed
 * @param  {Object} o the object with known values
 * @param  {Object} d a default in case s is not in o. (if unspecified default is s.)
 * @return {String}
 */
fi.tr = function tr(s, o, d) {
	return (
		o = o || L1.Translations.getCurrent(ctx) || {},
		~ _.keys(o).indexOf(s) ? o[s] : typeof d !== 'undefined' ? d : s
	);
};

/**
 * translate characters in a string
 * @param  {String} s  the string to translate
 * @param  {String} ss the substring to replace
 * @param  {String} r  the replacee string
 * @param  {String} f  regex flags, 'g' by default
 * @return {String}    a translated string
 */
fi.trC = function trC(s, ss, r, f) {
	return (s||'').replace(new RegExp(ss, typeof f === 'string' ? f : 'g'), r);
};

/**
 * filter a list for matching keys & values
 * @param  {Array} is a list of items
 * @param  {String} k the key to filter
 * @param  {String|Array} v the value to filter
 * @param  {Boolean} regex test the item against v as regex.
 * @return {Array}
 */
fi.filter = function filter(is,k,v,regex) {
	return _.filter(is, function(i) { return ! v ? _.get(i, k) : regex ? RegExp(v).test(_.get(i, k)) : !!~fi.plural(v).indexOf(_.get(i, k)) });
};

/**
 * filter a list for not matching keys & values
 * @param  {Array} is a list of items
 * @param  {String} k the key to filter
 * @param  {String|Array} v the value to filter
 * @return {Array}
 */
fi.filterWithout = function filterWithout(is,k,v) {
	return _.filter(is, function(i) { return ! (_.get(i, k) ? _.get(i, k) === v : false) });
};

/**
 * creates rearranges values and creates new date object
 * @param  {String} d   A date string (must be) formatted (d)d/(m)m/yyy - in parens means optional
 * @return {String}     a javascript date string
 */
fi.newDate = function date(d) {
	var dateArr = d.split('/');
	return dateArr.length === 3 ? new Date(dateArr[2], parseInt(dateArr[1]) - 1, dateArr[0]) : NaN;
};

/**
 * gets a function for a string filter or macro name.
 * @param  {String} f the name of a filter or macro.
 * @return {Function}   the function for the filer or macro name or noop.
 */
fi.identity = function identity(f) {
	return _.isFunction(es[f]) ? es[f] : _.isFunction(this.ctx[f]) ? this.ctx[f].bind(this.ctx) : _.noop;
};

/**
 * maps a function over a list
 * @param  {Array} is a list of items
 * @param  {Function} f  a function to apply to each item in the list
 * @param  {Array} (optional) ...args any additional arguments will be partially applied to f.
 * @return {Array}    a transformed list
 */
fi.fmap = function fmap(is, f /*, ...args */) {
	return fi.plural(is).map(_.partial.apply(_, [f, _].concat([].slice.call(arguments, 2))));
};

/**
 * parses JSON from a string.
 * @param  {String} s a JSON string
 * @return {any}   a parsed JSON document
 */
fi.parseJSON = function parseJSON(s) {
	return JSON.parse(s);
};

/**
 * takes a JavaScript object and returns a JSON string representing it.
 * @param  {any} any [description]
 * @return {[type]}   [description]
 */
fi.stringifyJSON = function stringifyJSON(any) {
	return JSON.stringify(any);
};

/**
 * reduce a list with a function
 * @param  {Array} is      a list to reduce
 * @param  {Function} f       function to reduce with
 * @param  {any} (Optional) initial an initial value for the reduction.
 * @return {any}
 */
fi.reduce = function reduce(is, f, initial) {
	return fi.plural(is).reduce(f, initial);
};

/**
 * concatenates two lists
 * @param  {Array} a list a
 * @param  {Array} b list b
 * @return {Array}   a new list of a and b
 */
fi.concat = function concat(a, b) {
	return a && b ? a.concat(b) : a && !b ? a : b;
};

/**
 * plucks multiple properties - like you might expect pluck to do...
 * @param  {Array} os list of objects
 * @param  {Array} ps array of properties
 * @return {Array}    new list of objects
 */
fi.pluckMany = function pluckMany(os, ps) {
	return _.map(os, function(o) { return _.pick(o, ps); });
};

/**
 * converts a twitter date into a UTC date
 * @param  {String} d a date as returned by the twitter API. e.g.
 * @return {[type]}   [description]
 */
fi.twitterDateAsUTCDate = function twitterDateAsUTCDate(d) {
	return (d = d.split(' '), [ d[0], d[1], d[2], d[5], d[3], 'GMT' + d[4] ].join(' '));
};

fi.tailString = function tailString(s, m) {
	return s.substring(s.lastIndexOf(m));
};

/**
 * replaces occurances of a substring with another string.
 * @param  {String} s the string to augment
 * @param  {String} m a substring to match (converted to RegExp)
 * @param  {String} p the replacement for the substring. (Use $1, $2, etc to use match groups / initial.)
 * @return {String}   the augmented string
 */
fi.replaceInString = function replaceInString(s, m, p) {
	return s.replace(RegExp(m, 'ig'), function() {
		var args = arguments;
		return p.replace(/\$([0-9])/ig, function(a, _m) {
			return args[_m - 1];
		});
	});
};

/**
 * slice an array (splice because slice is a default filter.)
 * @param  {Array} is items to slice
 * @param  {Number} a  Index to slice from
 * @param  {Number} (optional) b  Index to slice to
 * @return {Array}    a sliced list
 */
fi.splice = function splice(is, a, b) {
	return fi.plural(is).slice(a, b);
};


/**
 * splice an array
 * @param  {Array} 		is items to splice
 * @param  {Number} 	a  Index to splice from
 * @param  {Number} 	(optional) b  Index to splice to
 * @param  (optional) 	c  Item to inset at index a
 * @return {Array}   	a spliced list
 */
fi.spliceItem = function spliceItem(is, a, b, c) {
	return fi.plural(is).splice(a, b, c);
};

/**
 * deep merge that supports concating arrays & strings.
 * @param  {Object} o1           a plain object to merge
 * @param  {Object} o2           a plain object to merge
 * @param  {Boolean} mergeStrings will merge strings together if true
 * @return {Object}              the resulting merged object
 */
fi.deeperMerge = function deeperMerge(o1, o2, mergeStrings) {

	mergeStrings = typeof mergeStrings !== undefined ? mergeStrings : false;

	// exit conditions
	if      ( ! o1 && ! o2 )          { return; }
	else if ( ! _.isPlainObject(o1) ) { return o2; }
	else if ( ! _.isPlainObject(o2) ) { return o1; }

	return _
		.union(Object.keys(o1), Object.keys(o2))
		.map(function(k) {
			return [k, (
				( typeof o1[k] === 'string' && typeof o2[k] === 'string' ) ? ( mergeStrings ? o1[k] + o2[k] : o2[k] ) :
				( _.isPlainObject(o1[k]) || _.isPlainObject(o2[k]) ) ? deeperMerge(o1[k], o2[k], mergeStrings) :
				( _.isArray(o1[k]) && _.isArray(o2[k]) ) ? o1[k].concat(o2[k]) :
				( o1[k] && !o2[k] ) ? o1[k] : o2[k]
			)];
		})
		.reduce(function(a, b) { return (a[b[0]] = b[1], a) }, {});
};

fi.toCamelCase = function toCamelCase(s) {
	return s.trim().split(/-| /).reduce(function (pw, cw, i) {
		return pw += (i === 0 ? cw[0].toLowerCase() : cw[0].toUpperCase()) + cw.slice(1);
	}, '');
};

fi.toHyphenated = function toHyphenated(s) {
	return s.trim().toLowerCase().replace(/\s+/g, '-');
};

fi.padZeros = function padZeros(n, l) {
	var t = l - String(n).length;
	return Array((t > -1 ? t : 0) + 1).join('0') + String(n);
};

/**
 * generates a list of month / year pairs from the current month to the end of the following year.
 * @param  {Array<String>} ms  a list of month names
 * @param  {Number} max the number of items to list
 * @return {Array<Object>}     A list of objects with label and value.
 */
fi.monthYearRange = function monthYearRange(ms, max) {
	max = max || 10;
	return (
		ms
			.slice((new Date).getMonth())
			.map(function(m) { return [m, fi.padZeros(ms.indexOf(m) + 1, 2), (new Date).getFullYear()] })
			.concat( ms.map(function(m, i) { return [m, fi.padZeros(i + 1, 2), (new Date).getFullYear() + 1] }) )
			.slice(0, max)
			.map(function(r) {
				return {
					label: r[0] + ' ' + r[2],
					value: r[1] + '-' + r[2]
				};
			})
	);
};
//
/**
 * Converts a number of seconds to the format HH:mm:ss
 * @param  {Integer} d The number of seconds
 * @return {String} The seconds int the format HH:mm:ss
 * @see http://stackoverflow.com/a/5539081/486434
 */
fi.secondsToHms = function secondsToHms(d) {
	d = Number(d);
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);
	return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
};

/**
 * generate a range of times
 * @param  {String} from      time string with the format 00:00
 * @param  {String} to        time string with the format 00:00
 * @param  {Number} increment the number of minutes to increment by
 * @return {Array}           a range of times
 */
fi.timeRange = function timeRange(range, key) {
	var from = range[0]
		, to = range[1]
		, increment = range[2]
		, _from = from.split(':')
		, _to = to.split(':')
		, count = ((+_to[0] - +_from[0]) * 60) + (+_to[1] - +_from[1]);

	if ( count % increment === 0 ) {
		return (_
			.range((+_from[0]) * 60 + (+_from[1]), (+_to[0] * 60) + (+_to[1]), increment)
			.map(fi.secondsToHms)
			.map(function(time) {
				return [[(typeof key === 'string' ? key : 'value'), time]];
			})
		);
	} else {
		return [];
	}
};

fi.dayRange = function(range, key) {
	return (
		_.range(range[0], range[1] + 1).map(function(day) {
			return [[ typeof key === 'string' ? key : 'value', fi.padZeros(day, 2) ]];
		})
	);
};

/**
 * pluck an inner item for each item in a list
 * @param  {Array} is a list of objects
 * @param  {String} p  property to pluck (supporting 'foo.bar.baz' syntax.)
 * @return {Array}    list with inner values
 */
fi.pluck = function pluck(is, p) {
	return fi.plural(is).map(function(i) {
		return fi.get(i, p);
	});
};

/**
 * joins a list on a string
 * @param  {Array} is items
 * @param  {String} s  string to join the list on
 * @return {String}    joined items
 */
fi.join = function join(is, s) {
	return fi.plural(is).join(s);
};

fi.split = function split(s, delimiter) {
	return (s || '').split(delimiter);
};

/**
 * renders a macro
 * @param  {String|Function} m a macro name or function
 * @param {ArgumentsList} ...args further arguments will be passed to the macro or function
 * @return {String}   the rendered output
 */
fi.__call__ = function __call__(m /*, ...args */) {
	var args = [].slice.call(arguments, 1);
	if ( typeof m === 'function' ) {
		return m.apply(this.ctx, args);
	} else if ( ~ this.exported.indexOf(m) ) {
		return this.ctx[m].apply(this.ctx, args);
	}
};

/**
 * renders a string with nunjucks
 * @param  {String} s   a template string to render
 * @param  {Object} ctx the context that the template string should be rendered with
 * @return {String}     the rendered string
 */
fi.__renderString__ = function __renderString__(s, ctx) {
	try {
		return ( _.isString(s) && ctx ) ? nunjucks.renderString(s, ctx) : s;
	} catch(ex) {
		L1.Log.error(ex);
		return s;
	}
};

/**
 * Convert a number character to uppercased letter based on alphabet index.
 * @param  {String} n - Number character to conver to alpahbet character
 * @return {String} Converted character in Uppoercase
 */
fi.strNumToUpperChar = function strNumToUpperChar(n) {
	var value = parseInt(n);
	return String.fromCharCode(64 + value);
};

fi.setCtx = function(_ctx) {
	ctx = _ctx;
};

// export some lodash methods directly.
// See: https://lodash.com/docs
fi.merge = fi.m = _.merge;
fi.defaults = fi.ds = _.defaults;
fi.keys = _.keys;
fi.values = _.values;
fi.first = _.first;
fi.flatten = _.flatten;
fi.flattenDeep = _.flattenDeep;
fi.get = _.get;
fi.pick = _.pick;
fi.range = _.range;
fi.contains = _.contains;
fi.zipObject = function(a) { return _.zipObject(a) };
fi.omit = _.omit;
fi.clone = _.clone;
fi.kebabCase = _.kebabCase;

exports.items = fi;
