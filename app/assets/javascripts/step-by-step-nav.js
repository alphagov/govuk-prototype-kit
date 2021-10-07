// Based on https://github.com/alphagov/govuk_publishing_components/blob/v27.4.0/app/assets/javascripts/govuk_publishing_components/components/step-by-step-nav.js

/**
 * classList polyfill
 * https://github.com/alphagov/govuk-frontend/blob/main/package/govuk/vendor/polyfills/Element/prototype/classList.js
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define('GOVUKFrontend', factory) :
	(factory());
}(this, (function () { 'use strict';

(function(undefined) {

// Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Object/defineProperty/detect.js
var detect = (
  // In IE8, defineProperty could only act on DOM elements, so full support
  // for the feature requires the ability to set a property on an arbitrary object
  'defineProperty' in Object && (function() {
  	try {
  		var a = {};
  		Object.defineProperty(a, 'test', {value:42});
  		return true;
  	} catch(e) {
  		return false
  	}
  }())
);

if (detect) return

// Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Object.defineProperty&flags=always
(function (nativeDefineProperty) {

	var supportsAccessors = Object.prototype.hasOwnProperty('__defineGetter__');
	var ERR_ACCESSORS_NOT_SUPPORTED = 'Getters & setters cannot be defined on this javascript engine';
	var ERR_VALUE_ACCESSORS = 'A property cannot both have accessors and be writable or have a value';

	Object.defineProperty = function defineProperty(object, property, descriptor) {

		// Where native support exists, assume it
		if (nativeDefineProperty && (object === window || object === document || object === Element.prototype || object instanceof Element)) {
			return nativeDefineProperty(object, property, descriptor);
		}

		if (object === null || !(object instanceof Object || typeof object === 'object')) {
			throw new TypeError('Object.defineProperty called on non-object');
		}

		if (!(descriptor instanceof Object)) {
			throw new TypeError('Property description must be an object');
		}

		var propertyString = String(property);
		var hasValueOrWritable = 'value' in descriptor || 'writable' in descriptor;
		var getterType = 'get' in descriptor && typeof descriptor.get;
		var setterType = 'set' in descriptor && typeof descriptor.set;

		// handle descriptor.get
		if (getterType) {
			if (getterType !== 'function') {
				throw new TypeError('Getter must be a function');
			}
			if (!supportsAccessors) {
				throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
			}
			if (hasValueOrWritable) {
				throw new TypeError(ERR_VALUE_ACCESSORS);
			}
			Object.__defineGetter__.call(object, propertyString, descriptor.get);
		} else {
			object[propertyString] = descriptor.value;
		}

		// handle descriptor.set
		if (setterType) {
			if (setterType !== 'function') {
				throw new TypeError('Setter must be a function');
			}
			if (!supportsAccessors) {
				throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
			}
			if (hasValueOrWritable) {
				throw new TypeError(ERR_VALUE_ACCESSORS);
			}
			Object.__defineSetter__.call(object, propertyString, descriptor.set);
		}

		// OK to define value unconditionally - if a getter has been specified as well, an error would be thrown above
		if ('value' in descriptor) {
			object[propertyString] = descriptor.value;
		}

		return object;
	};
}(Object.defineProperty));
})
.call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

(function(undefined) {

    // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/master/packages/polyfill-library/polyfills/DOMTokenList/detect.js
    var detect = (
      'DOMTokenList' in this && (function (x) {
        return 'classList' in x ? !x.classList.toggle('x', false) && !x.className : true;
      })(document.createElement('x'))
    );

    if (detect) return

    // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/master/packages/polyfill-library/polyfills/DOMTokenList/polyfill.js
    (function (global) {
      var nativeImpl = "DOMTokenList" in global && global.DOMTokenList;

      if (
          !nativeImpl ||
          (
            !!document.createElementNS &&
            !!document.createElementNS('http://www.w3.org/2000/svg', 'svg') &&
            !(document.createElementNS("http://www.w3.org/2000/svg", "svg").classList instanceof DOMTokenList)
          )
        ) {
        global.DOMTokenList = (function() { // eslint-disable-line no-unused-vars
          var dpSupport = true;
          var defineGetter = function (object, name, fn, configurable) {
            if (Object.defineProperty)
              Object.defineProperty(object, name, {
                configurable: false === dpSupport ? true : !!configurable,
                get: fn
              });

            else object.__defineGetter__(name, fn);
          };

          /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
          try {
            defineGetter({}, "support");
          }
          catch (e) {
            dpSupport = false;
          }


          var _DOMTokenList = function (el, prop) {
            var that = this;
            var tokens = [];
            var tokenMap = {};
            var length = 0;
            var maxLength = 0;
            var addIndexGetter = function (i) {
              defineGetter(that, i, function () {
                preop();
                return tokens[i];
              }, false);

            };
            var reindex = function () {

              /** Define getter functions for array-like access to the tokenList's contents. */
              if (length >= maxLength)
                for (; maxLength < length; ++maxLength) {
                  addIndexGetter(maxLength);
                }
            };

            /** Helper function called at the start of each class method. Internal use only. */
            var preop = function () {
              var error;
              var i;
              var args = arguments;
              var rSpace = /\s+/;

              /** Validate the token/s passed to an instance method, if any. */
              if (args.length)
                for (i = 0; i < args.length; ++i)
                  if (rSpace.test(args[i])) {
                    error = new SyntaxError('String "' + args[i] + '" ' + "contains" + ' an invalid character');
                    error.code = 5;
                    error.name = "InvalidCharacterError";
                    throw error;
                  }


              /** Split the new value apart by whitespace*/
              if (typeof el[prop] === "object") {
                tokens = ("" + el[prop].baseVal).replace(/^\s+|\s+$/g, "").split(rSpace);
              } else {
                tokens = ("" + el[prop]).replace(/^\s+|\s+$/g, "").split(rSpace);
              }

              /** Avoid treating blank strings as single-item token lists */
              if ("" === tokens[0]) tokens = [];

              /** Repopulate the internal token lists */
              tokenMap = {};
              for (i = 0; i < tokens.length; ++i)
                tokenMap[tokens[i]] = true;
              length = tokens.length;
              reindex();
            };

            /** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
            preop();

            /** Return the number of tokens in the underlying string. Read-only. */
            defineGetter(that, "length", function () {
              preop();
              return length;
            });

            /** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
            that.toLocaleString =
              that.toString = function () {
                preop();
                return tokens.join(" ");
              };

            that.item = function (idx) {
              preop();
              return tokens[idx];
            };

            that.contains = function (token) {
              preop();
              return !!tokenMap[token];
            };

            that.add = function () {
              preop.apply(that, args = arguments);

              for (var args, token, i = 0, l = args.length; i < l; ++i) {
                token = args[i];
                if (!tokenMap[token]) {
                  tokens.push(token);
                  tokenMap[token] = true;
                }
              }

              /** Update the targeted attribute of the attached element if the token list's changed. */
              if (length !== tokens.length) {
                length = tokens.length >>> 0;
                if (typeof el[prop] === "object") {
                  el[prop].baseVal = tokens.join(" ");
                } else {
                  el[prop] = tokens.join(" ");
                }
                reindex();
              }
            };

            that.remove = function () {
              preop.apply(that, args = arguments);

              /** Build a hash of token names to compare against when recollecting our token list. */
              for (var args, ignore = {}, i = 0, t = []; i < args.length; ++i) {
                ignore[args[i]] = true;
                delete tokenMap[args[i]];
              }

              /** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
              for (i = 0; i < tokens.length; ++i)
                if (!ignore[tokens[i]]) t.push(tokens[i]);

              tokens = t;
              length = t.length >>> 0;

              /** Update the targeted attribute of the attached element. */
              if (typeof el[prop] === "object") {
                el[prop].baseVal = tokens.join(" ");
              } else {
                el[prop] = tokens.join(" ");
              }
              reindex();
            };

            that.toggle = function (token, force) {
              preop.apply(that, [token]);

              /** Token state's being forced. */
              if (undefined !== force) {
                if (force) {
                  that.add(token);
                  return true;
                } else {
                  that.remove(token);
                  return false;
                }
              }

              /** Token already exists in tokenList. Remove it, and return FALSE. */
              if (tokenMap[token]) {
                that.remove(token);
                return false;
              }

              /** Otherwise, add the token and return TRUE. */
              that.add(token);
              return true;
            };

            return that;
          };

          return _DOMTokenList;
        }());
      }

      // Add second argument to native DOMTokenList.toggle() if necessary
      (function () {
        var e = document.createElement('span');
        if (!('classList' in e)) return;
        e.classList.toggle('x', false);
        if (!e.classList.contains('x')) return;
        e.classList.constructor.prototype.toggle = function toggle(token /*, force*/) {
          var force = arguments[1];
          if (force === undefined) {
            var add = !this.contains(token);
            this[add ? 'add' : 'remove'](token);
            return add;
          }
          force = !!force;
          this[force ? 'add' : 'remove'](token);
          return force;
        };
      }());

      // Add multiple arguments to native DOMTokenList.add() if necessary
      (function () {
        var e = document.createElement('span');
        if (!('classList' in e)) return;
        e.classList.add('a', 'b');
        if (e.classList.contains('b')) return;
        var native = e.classList.constructor.prototype.add;
        e.classList.constructor.prototype.add = function () {
          var args = arguments;
          var l = arguments.length;
          for (var i = 0; i < l; i++) {
            native.call(this, args[i]);
          }
        };
      }());

      // Add multiple arguments to native DOMTokenList.remove() if necessary
      (function () {
        var e = document.createElement('span');
        if (!('classList' in e)) return;
        e.classList.add('a');
        e.classList.add('b');
        e.classList.remove('a', 'b');
        if (!e.classList.contains('b')) return;
        var native = e.classList.constructor.prototype.remove;
        e.classList.constructor.prototype.remove = function () {
          var args = arguments;
          var l = arguments.length;
          for (var i = 0; i < l; i++) {
            native.call(this, args[i]);
          }
        };
      }());

    }(this));

}).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

(function(undefined) {

// Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Document/detect.js
var detect = ("Document" in this);

if (detect) return

// Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Document&flags=always
if ((typeof WorkerGlobalScope === "undefined") && (typeof importScripts !== "function")) {

	if (this.HTMLDocument) { // IE8

		// HTMLDocument is an extension of Document.  If the browser has HTMLDocument but not Document, the former will suffice as an alias for the latter.
		this.Document = this.HTMLDocument;

	} else {

		// Create an empty function to act as the missing constructor for the document object, attach the document object as its prototype.  The function needs to be anonymous else it is hoisted and causes the feature detect to prematurely pass, preventing the assignments below being made.
		this.Document = this.HTMLDocument = document.constructor = (new Function('return function Document() {}')());
		this.Document.prototype = document;
	}
}


})
.call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

(function(undefined) {

// Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Element/detect.js
var detect = ('Element' in this && 'HTMLElement' in this);

if (detect) return

// Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Element&flags=always
(function () {

	// IE8
	if (window.Element && !window.HTMLElement) {
		window.HTMLElement = window.Element;
		return;
	}

	// create Element constructor
	window.Element = window.HTMLElement = new Function('return function Element() {}')();

	// generate sandboxed iframe
	var vbody = document.appendChild(document.createElement('body'));
	var frame = vbody.appendChild(document.createElement('iframe'));

	// use sandboxed iframe to replicate Element functionality
	var frameDocument = frame.contentWindow.document;
	var prototype = Element.prototype = frameDocument.appendChild(frameDocument.createElement('*'));
	var cache = {};

	// polyfill Element.prototype on an element
	var shiv = function (element, deep) {
		var
		childNodes = element.childNodes || [],
		index = -1,
		key, value, childNode;

		if (element.nodeType === 1 && element.constructor !== Element) {
			element.constructor = Element;

			for (key in cache) {
				value = cache[key];
				element[key] = value;
			}
		}

		while (childNode = deep && childNodes[++index]) {
			shiv(childNode, deep);
		}

		return element;
	};

	var elements = document.getElementsByTagName('*');
	var nativeCreateElement = document.createElement;
	var interval;
	var loopLimit = 100;

	prototype.attachEvent('onpropertychange', function (event) {
		var
		propertyName = event.propertyName,
		nonValue = !cache.hasOwnProperty(propertyName),
		newValue = prototype[propertyName],
		oldValue = cache[propertyName],
		index = -1,
		element;

		while (element = elements[++index]) {
			if (element.nodeType === 1) {
				if (nonValue || element[propertyName] === oldValue) {
					element[propertyName] = newValue;
				}
			}
		}

		cache[propertyName] = newValue;
	});

	prototype.constructor = Element;

	if (!prototype.hasAttribute) {
		// <Element>.hasAttribute
		prototype.hasAttribute = function hasAttribute(name) {
			return this.getAttribute(name) !== null;
		};
	}

	// Apply Element prototype to the pre-existing DOM as soon as the body element appears.
	function bodyCheck() {
		if (!(loopLimit--)) clearTimeout(interval);
		if (document.body && !document.body.prototype && /(complete|interactive)/.test(document.readyState)) {
			shiv(document, true);
			if (interval && document.body.prototype) clearTimeout(interval);
			return (!!document.body.prototype);
		}
		return false;
	}
	if (!bodyCheck()) {
		document.onreadystatechange = bodyCheck;
		interval = setInterval(bodyCheck, 25);
	}

	// Apply to any new elements created after load
	document.createElement = function createElement(nodeName) {
		var element = nativeCreateElement(String(nodeName).toLowerCase());
		return shiv(element);
	};

	// remove sandboxed iframe
	document.removeChild(vbody);
}());

})
.call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

(function(undefined) {

    // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/8717a9e04ac7aff99b4980fbedead98036b0929a/packages/polyfill-library/polyfills/Element/prototype/classList/detect.js
    var detect = (
      'document' in this && "classList" in document.documentElement && 'Element' in this && 'classList' in Element.prototype && (function () {
        var e = document.createElement('span');
        e.classList.add('a', 'b');
        return e.classList.contains('b');
      }())
    );

    if (detect) return

    // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Element.prototype.classList&flags=always
    (function (global) {
      var dpSupport = true;
      var defineGetter = function (object, name, fn, configurable) {
        if (Object.defineProperty)
          Object.defineProperty(object, name, {
            configurable: false === dpSupport ? true : !!configurable,
            get: fn
          });

        else object.__defineGetter__(name, fn);
      };
      /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
      try {
        defineGetter({}, "support");
      }
      catch (e) {
        dpSupport = false;
      }
      /** Polyfills a property with a DOMTokenList */
      var addProp = function (o, name, attr) {

        defineGetter(o.prototype, name, function () {
          var tokenList;

          var THIS = this,

          /** Prevent this from firing twice for some reason. What the hell, IE. */
          gibberishProperty = "__defineGetter__" + "DEFINE_PROPERTY" + name;
          if(THIS[gibberishProperty]) return tokenList;
          THIS[gibberishProperty] = true;

          /**
           * IE8 can't define properties on native JavaScript objects, so we'll use a dumb hack instead.
           *
           * What this is doing is creating a dummy element ("reflection") inside a detached phantom node ("mirror")
           * that serves as the target of Object.defineProperty instead. While we could simply use the subject HTML
           * element instead, this would conflict with element types which use indexed properties (such as forms and
           * select lists).
           */
          if (false === dpSupport) {

            var visage;
            var mirror = addProp.mirror || document.createElement("div");
            var reflections = mirror.childNodes;
            var l = reflections.length;

            for (var i = 0; i < l; ++i)
              if (reflections[i]._R === THIS) {
                visage = reflections[i];
                break;
              }

            /** Couldn't find an element's reflection inside the mirror. Materialise one. */
            visage || (visage = mirror.appendChild(document.createElement("div")));

            tokenList = DOMTokenList.call(visage, THIS, attr);
          } else tokenList = new DOMTokenList(THIS, attr);

          defineGetter(THIS, name, function () {
            return tokenList;
          });
          delete THIS[gibberishProperty];

          return tokenList;
        }, true);
      };

      addProp(global.Element, "classList", "className");
      addProp(global.HTMLElement, "classList", "className");
      addProp(global.HTMLLinkElement, "relList", "rel");
      addProp(global.HTMLAnchorElement, "relList", "rel");
      addProp(global.HTMLAreaElement, "relList", "rel");
    }(this));

}).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});

})));

/**
 * closest polyfill
 * https://github.com/alphagov/govuk_publishing_components/blob/master/app/assets/javascripts/govuk_publishing_components/vendor/polyfills/closest.js
 */

// https://plainjs.com/javascript/traversing/get-closest-element-by-selector-39/
// matches polyfill
this.Element && function(ElementPrototype) {
  ElementPrototype.matches = ElementPrototype.matches ||
  ElementPrototype.matchesSelector ||
  ElementPrototype.webkitMatchesSelector ||
  ElementPrototype.msMatchesSelector ||
  function(selector) {
    var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
    while (nodes[++i] && nodes[i] != node);
    return !!nodes[i];
  }
}(Element.prototype);

// closest polyfill
this.Element && function(ElementPrototype) {
  ElementPrototype.closest = ElementPrototype.closest ||
  function(selector) {
    var el = this;
    while (el.matches && !el.matches(selector)) el = el.parentNode;
    return el.matches ? el : null;
  }
}(Element.prototype);

/**
 * indexOf Polyfill
 * https://github.com/alphagov/govuk_publishing_components/blob/master/app/assets/javascripts/govuk_publishing_components/vendor/polyfills/indexOf.js
 */

// indexOf Polyfill
// https://gist.github.com/heathcliff/7161329
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i++) {
      if (this[i] === obj) { return i }
    }
    return -1
  }
}

window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

(function (Modules) {
  function AppStepNav ($module) {
    this.$module = $module
    this.$module.actions = {} // stores text for JS appended elements 'show' and 'hide' on steps, and 'show/hide all' button
    this.$module.rememberShownStep = false
    this.$module.stepNavSize = false
    this.$module.sessionStoreLink = 'govuk-step-nav-active-link'
    this.$module.activeLinkClass = 'app-step-nav__list-item--active'
    this.$module.activeStepClass = 'app-step-nav__step--active'
    this.$module.activeLinkHref = '#content'
    this.$module.uniqueId = false
  }

  AppStepNav.prototype.init = function () {
    // Indicate that js has worked
    this.$module.classList.add('app-step-nav--active')

    // Prevent FOUC, remove class hiding content
    this.$module.classList.remove('js-hidden')

    this.$module.stepNavSize = this.$module.classList.contains('app-step-nav--large') ? 'Big' : 'Small'
    this.$module.rememberShownStep = !!this.$module.hasAttribute('data-remember') && this.$module.stepNavSize === 'Big'

    this.$module.steps = this.$module.querySelectorAll('.js-step')
    this.$module.stepHeaders = this.$module.querySelectorAll('.js-toggle-panel')
    this.$module.totalSteps = this.$module.querySelectorAll('.js-panel').length
    this.$module.totalLinks = this.$module.querySelectorAll('.app-step-nav__link').length
    this.$module.showOrHideAllButton = false

    this.$module.uniqueId = this.$module.getAttribute('data-id') || false

    if (this.$module.uniqueId) {
      this.$module.sessionStoreLink = this.$module.sessionStoreLink + '_' + this.$module.uniqueId
    }

    this.$module.upChevronSvg = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="app-step-nav__chevron-stroke" d="M19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.499997 15.2467 0.499998 10C0.499999 4.7533 4.7533 0.500001 10 0.500002C15.2467 0.500003 19.5 4.7533 19.5 10Z" stroke="#1D70B8"/>' +
      '<path class="app-step-nav__chevron-stroke" d="M6.32617 12.3262L10 8.65234L13.6738 12.3262" stroke="#1D70B8" stroke-width="2"/>' +
      '</svg>'
    this.$module.downChevronSvg = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="app-step-nav__chevron-stroke" d="M0.499997 10C0.499998 4.75329 4.75329 0.499999 10 0.499999C15.2467 0.5 19.5 4.75329 19.5 10C19.5 15.2467 15.2467 19.5 10 19.5C4.75329 19.5 0.499997 15.2467 0.499997 10Z" stroke="#1D70B8"/>' +
      '<path class="app-step-nav__chevron-stroke" d="M13.6738 8.67383L10 12.3477L6.32617 8.67383" stroke="#1D70B8" stroke-width="2"/>' +
      '</svg>'

    var stepNavTracker = new this.StepNavTracker(this.$module.uniqueId, this.$module.totalSteps, this.$module.totalLinks)

    this.getTextForInsertedElements()
    this.addButtonstoSteps()
    this.addShowHideAllButton()
    this.addShowHideToggle()
    this.addAriaControlsAttrForShowHideAllButton()

    this.ensureOnlyOneActiveLink()
    this.showPreviouslyOpenedSteps()

    this.bindToggleForSteps(stepNavTracker)
    this.bindToggleShowHideAllButton(stepNavTracker)
    this.bindComponentLinkClicks(stepNavTracker)
  }

  AppStepNav.prototype.getTextForInsertedElements = function () {
    this.$module.actions.showText = this.$module.getAttribute('data-show-text')
    this.$module.actions.hideText = this.$module.getAttribute('data-hide-text')
    this.$module.actions.showAllText = this.$module.getAttribute('data-show-all-text')
    this.$module.actions.hideAllText = this.$module.getAttribute('data-hide-all-text')
  }

  AppStepNav.prototype.addShowHideAllButton = function () {
    var showall = document.createElement('div')
    showall.className = 'app-step-nav__controls govuk-!-display-none-print'
    showall.innerHTML = '<button aria-expanded="false" class="app-step-nav__button app-step-nav__button--controls js-step-controls-button">' +
      '<span class="app-step-nav__button-text app-step-nav__button-text--all js-step-controls-button-text">' + this.$module.actions.showAllText + '</span>' +
      '<span class="app-step-nav__chevron js-step-controls-button-icon">' + this.$module.downChevronSvg + '</span>' +
      '</button>'

    var steps = this.$module.querySelectorAll('.app-step-nav__steps')[0]
    this.$module.insertBefore(showall, steps)

    this.$module.showOrHideAllButton = this.$module.querySelectorAll('.js-step-controls-button')[0]
  }

  AppStepNav.prototype.addShowHideToggle = function () {
    for (var i = 0; i < this.$module.stepHeaders.length; i++) {
      var thisel = this.$module.stepHeaders[i]

      if (!thisel.querySelectorAll('.js-toggle-link').length) {
        var span = document.createElement('span')
        var showHideSpan = document.createElement('span')
        var showHideSpanText = document.createElement('span')
        var showHideSpanIcon = document.createElement('span')
        var commaSpan = document.createElement('span')
        var thisSectionSpan = document.createElement('span')

        showHideSpan.className = 'app-step-nav__toggle-link js-toggle-link govuk-!-display-none-print'
        showHideSpanText.className = 'app-step-nav__button-text js-toggle-link-text'
        showHideSpanIcon.className = 'app-step-nav__chevron js-toggle-link-icon'
        commaSpan.className = 'govuk-visually-hidden'
        thisSectionSpan.className = 'govuk-visually-hidden'

        showHideSpan.appendChild(showHideSpanText)
        showHideSpan.appendChild(showHideSpanIcon)

        commaSpan.innerHTML = ', '
        thisSectionSpan.innerHTML = ' this section'

        span.appendChild(commaSpan)
        span.appendChild(showHideSpan)
        span.appendChild(thisSectionSpan)

        thisel.querySelectorAll('.js-step-title-button')[0].appendChild(span)
      }
    }
  }

  AppStepNav.prototype.headerIsOpen = function (stepHeader) {
    return (typeof stepHeader.parentNode.getAttribute('show') !== 'undefined')
  }

  AppStepNav.prototype.addAriaControlsAttrForShowHideAllButton = function () {
    var ariaControlsValue = this.$module.querySelectorAll('.js-panel')[0].getAttribute('id')
    this.$module.showOrHideAllButton.setAttribute('aria-controls', ariaControlsValue)
  }

  // called by show all/hide all, sets all steps accordingly
  AppStepNav.prototype.setAllStepsShownState = function (isShown) {
    var data = []

    for (var i = 0; i < this.$module.steps.length; i++) {
      var stepView = new this.StepView(this.$module.steps[i], this.$module)
      stepView.setIsShown(isShown)

      if (isShown) {
        data.push(this.$module.steps[i].getAttribute('id'))
      }
    }

    if (isShown) {
      this.saveToSessionStorage(this.$module.uniqueId, JSON.stringify(data))
    } else {
      this.removeFromSessionStorage(this.$module.uniqueId)
    }
  }

  // called on load, determines whether each step should be open or closed
  AppStepNav.prototype.showPreviouslyOpenedSteps = function () {
    var data = this.loadFromSessionStorage(this.$module.uniqueId) || []

    for (var i = 0; i < this.$module.steps.length; i++) {
      var thisel = this.$module.steps[i]
      var id = thisel.getAttribute('id')
      var stepView = new this.StepView(thisel, this.$module)
      var shouldBeShown = thisel.hasAttribute('data-show')

      // show the step if it has been remembered or if it has the 'data-show' attribute
      if ((this.$module.rememberShownStep && data.indexOf(id) > -1) || (shouldBeShown && shouldBeShown !== 'undefined')) {
        stepView.setIsShown(true)
      } else {
        stepView.setIsShown(false)
      }
    }

    if (data.length > 0) {
      this.$module.showOrHideAllButton.setAttribute('aria-expanded', true)
      this.setShowHideAllText()
    }
  }

  AppStepNav.prototype.addButtonstoSteps = function () {
    for (var i = 0; i < this.$module.steps.length; i++) {
      var thisel = this.$module.steps[i]
      var title = thisel.querySelectorAll('.js-step-title')[0]
      var contentId = thisel.querySelectorAll('.js-panel')[0].getAttribute('id')
      var titleText = title.textContent || title.innerText // IE8 fallback

      title.outerHTML =
        '<span class="js-step-title">' +
          '<button ' +
            'class="app-step-nav__button app-step-nav__button--title js-step-title-button" ' +
            'aria-expanded="false" aria-controls="' + contentId + '">' +
              '<span class="app-step-nav__title-text js-step-title-text">' + titleText + '</span>' +
          '</button>' +
        '</span>'
    }
  }

  AppStepNav.prototype.bindToggleForSteps = function (stepNavTracker) {
    var that = this
    var togglePanels = this.$module.querySelectorAll('.js-toggle-panel')

    for (var i = 0; i < togglePanels.length; i++) {
      togglePanels[i].addEventListener('click', function (event) {
        var stepView = new that.StepView(this.parentNode, that.$module)
        stepView.toggle()

        var stepIsOptional = this.parentNode.hasAttribute('data-optional')
        var toggleClick = new that.StepToggleClick(event, stepView, stepNavTracker, stepIsOptional, that.$module.stepNavSize)
        toggleClick.trackClick()

        that.setShowHideAllText()
        that.rememberStepState(this.parentNode)
      })
    }
  }

  // if the step is open, store its id in session store
  // if the step is closed, remove its id from session store
  AppStepNav.prototype.rememberStepState = function (step) {
    if (this.$module.rememberShownStep) {
      var data = JSON.parse(this.loadFromSessionStorage(this.$module.uniqueId)) || []
      var thisstep = step.getAttribute('id')
      var shown = step.classList.contains('step-is-shown')

      if (shown) {
        data.push(thisstep)
      } else {
        var i = data.indexOf(thisstep)
        if (i > -1) {
          data.splice(i, 1)
        }
      }
      this.saveToSessionStorage(this.$module.uniqueId, JSON.stringify(data))
    }
  }

  // tracking click events on links in step content
  AppStepNav.prototype.bindComponentLinkClicks = function (stepNavTracker) {
    var jsLinks = this.$module.querySelectorAll('.js-link')
    var that = this

    for (var i = 0; i < jsLinks.length; i++) {
      jsLinks[i].addEventListener('click', function (event) {
        var dataPosition = this.getAttribute('data-position')
        var linkClick = new that.ComponentLinkClick(event, stepNavTracker, dataPosition, that.$module.stepNavSize)
        linkClick.trackClick()

        if (this.getAttribute('rel') !== 'external') {
          that.saveToSessionStorage(that.$module.sessionStoreLink, dataPosition)
        }

        if (this.getAttribute('href') === that.$module.activeLinkHref) {
          that.setOnlyThisLinkActive(this)
          that.setActiveStepClass()
        }
      })
    }
  }

  AppStepNav.prototype.saveToSessionStorage = function (key, value) {
    window.sessionStorage.setItem(key, value)
  }

  AppStepNav.prototype.loadFromSessionStorage = function (key, value) {
    return window.sessionStorage.getItem(key)
  }

  AppStepNav.prototype.removeFromSessionStorage = function (key) {
    window.sessionStorage.removeItem(key)
  }

  AppStepNav.prototype.setOnlyThisLinkActive = function (clicked) {
    var allActiveLinks = this.$module.querySelectorAll('.' + this.$module.activeLinkClass)
    for (var i = 0; i < allActiveLinks.length; i++) {
      allActiveLinks[i].classList.remove(this.$module.activeLinkClass)
    }
    clicked.parentNode.classList.add(this.$module.activeLinkClass)
  }

  // if a link occurs more than once in a step nav, the backend doesn't know which one to highlight
  // so it gives all those links the 'active' attribute and highlights the last step containing that link
  // if the user clicked on one of those links previously, it will be in the session store
  // this code ensures only that link and its corresponding step have the highlighting
  // otherwise it accepts what the backend has already passed to the component
  AppStepNav.prototype.ensureOnlyOneActiveLink = function () {
    var activeLinks = this.$module.querySelectorAll('.js-list-item.' + this.$module.activeLinkClass)

    if (activeLinks.length <= 1) {
      return
    }

    var loaded = this.loadFromSessionStorage(this.$module.sessionStoreLink)
    var activeParent = this.$module.querySelectorAll('.' + this.$module.activeLinkClass)[0]
    var activeChild = activeParent.firstChild
    var foundLink = activeChild.getAttribute('data-position')
    var lastClicked = loaded || foundLink // the value saved has priority

    // it's possible for the saved link position value to not match any of the currently duplicate highlighted links
    // so check this otherwise it'll take the highlighting off all of them
    var checkLink = this.$module.querySelectorAll('[data-position="' + lastClicked + '"]')[0]

    if (checkLink) {
      if (!checkLink.parentNode.classList.contains(this.$module.activeLinkClass)) {
        lastClicked = checkLink
      }
    } else {
      lastClicked = foundLink
    }

    this.removeActiveStateFromAllButCurrent(activeLinks, lastClicked)
    this.setActiveStepClass()
  }

  AppStepNav.prototype.removeActiveStateFromAllButCurrent = function (activeLinks, current) {
    for (var i = 0; i < activeLinks.length; i++) {
      var thisel = activeLinks[i]
      if (thisel.querySelectorAll('.js-link')[0].getAttribute('data-position').toString() !== current.toString()) {
        thisel.classList.remove(this.$module.activeLinkClass)
        var visuallyHidden = thisel.querySelectorAll('.visuallyhidden')
        if (visuallyHidden.length) {
          visuallyHidden[0].parentNode.removeChild(visuallyHidden[0])
        }
      }
    }
  }

  AppStepNav.prototype.setActiveStepClass = function () {
    // remove the 'active/open' state from all steps
    var allActiveSteps = this.$module.querySelectorAll('.' + this.$module.activeStepClass)
    for (var i = 0; i < allActiveSteps.length; i++) {
      allActiveSteps[i].classList.remove(this.$module.activeStepClass)
      allActiveSteps[i].removeAttribute('data-show')
    }

    // find the current page link and apply 'active/open' state to parent step
    var activeLink = this.$module.querySelectorAll('.' + this.$module.activeLinkClass)[0]
    if (activeLink) {
      var activeStep = activeLink.closest('.app-step-nav__step')
      activeStep.classList.add(this.$module.activeStepClass)
      activeStep.setAttribute('data-show', '')
    }
  }

  AppStepNav.prototype.bindToggleShowHideAllButton = function (stepNavTracker) {
    var that = this

    this.$module.showOrHideAllButton.addEventListener('click', function (event) {
      var textContent = this.textContent || this.innerText
      var shouldShowAll = textContent === that.$module.actions.showAllText

      // Fire GA click tracking
      stepNavTracker.trackClick('pageElementInteraction', (shouldShowAll ? 'stepNavAllShown' : 'stepNavAllHidden'), {
        label: (shouldShowAll ? that.$module.actions.showAllText : that.$module.actions.hideAllText) + ': ' + that.$module.stepNavSize
      })

      that.setAllStepsShownState(shouldShowAll)
      that.$module.showOrHideAllButton.setAttribute('aria-expanded', shouldShowAll)
      that.setShowHideAllText()

      return false
    })
  }

  AppStepNav.prototype.setShowHideAllText = function () {
    var shownSteps = this.$module.querySelectorAll('.step-is-shown').length

    // Find out if the number of is-opens == total number of steps
    var shownStepsIsTotalSteps = shownSteps === this.$module.totalSteps

    this.$module.showOrHideAllButton.querySelector('.js-step-controls-button-text').innerHTML = shownStepsIsTotalSteps ? this.$module.actions.hideAllText : this.$module.actions.showAllText
    this.$module.showOrHideAllButton.querySelector('.js-step-controls-button-icon').innerHTML = shownStepsIsTotalSteps ? this.$module.upChevronSvg : this.$module.downChevronSvg
  }

  AppStepNav.prototype.StepView = function (stepElement, $module) {
    this.stepElement = stepElement
    this.stepContent = this.stepElement.querySelectorAll('.js-panel')[0]
    this.titleButton = this.stepElement.querySelectorAll('.js-step-title-button')[0]
    var textElement = this.stepElement.querySelectorAll('.js-step-title-text')[0]
    this.title = textElement.textContent || textElement.innerText
    this.title = this.title.replace(/^\s+|\s+$/g, '') // this is 'trim' but supporting IE8
    this.showText = $module.actions.showText
    this.hideText = $module.actions.hideText
    this.upChevronSvg = $module.upChevronSvg
    this.downChevronSvg = $module.downChevronSvg

    this.show = function () {
      this.setIsShown(true)
    }

    this.hide = function () {
      this.setIsShown(false)
    }

    this.toggle = function () {
      this.setIsShown(this.isHidden())
    }

    this.setIsShown = function (isShown) {
      if (isShown) {
        this.stepElement.classList.add('step-is-shown')
        this.stepContent.classList.remove('js-hidden')
      } else {
        this.stepElement.classList.remove('step-is-shown')
        this.stepContent.classList.add('js-hidden')
      }

      this.titleButton.setAttribute('aria-expanded', isShown)
      var showHideText = this.stepElement.querySelectorAll('.js-toggle-link')[0]

      showHideText.querySelector('.js-toggle-link-text').innerHTML = isShown ? this.hideText : this.showText
      showHideText.querySelector('.js-toggle-link-icon').innerHTML = isShown ? this.upChevronSvg : this.downChevronSvg
    }

    this.isShown = function () {
      return this.stepElement.classList.contains('step-is-shown')
    }

    this.isHidden = function () {
      return !this.isShown()
    }

    this.numberOfContentItems = function () {
      return this.stepContent.querySelectorAll('.js-link').length
    }
  }

  AppStepNav.prototype.StepToggleClick = function (event, stepView, stepNavTracker, stepIsOptional, stepNavSize) {
    this.target = event.target
    this.stepIsOptional = stepIsOptional
    this.stepNavSize = stepNavSize

    this.trackClick = function () {
      var trackingOptions = { label: this.trackingLabel(), dimension28: stepView.numberOfContentItems().toString() }
      stepNavTracker.trackClick('pageElementInteraction', this.trackingAction(), trackingOptions)
    }

    this.trackingLabel = function () {
      var clickedNearbyToggle = this.target.closest('.js-step').querySelectorAll('.js-toggle-panel')[0]
      return clickedNearbyToggle.getAttribute('data-position') + ' - ' + stepView.title + ' - ' + this.locateClickElement() + ': ' + this.stepNavSize + this.isOptional()
    }

    // returns index of the clicked step in the overall number of steps
    this.stepIndex = function () { // eslint-disable-line no-unused-vars
      return this.$module.steps.index(stepView.element) + 1
    }

    this.trackingAction = function () {
      return (stepView.isHidden() ? 'stepNavHidden' : 'stepNavShown')
    }

    this.locateClickElement = function () {
      if (this.clickedOnIcon()) {
        return this.iconType() + ' click'
      } else if (this.clickedOnHeading()) {
        return 'Heading click'
      } else {
        return 'Elsewhere click'
      }
    }

    this.clickedOnIcon = function () {
      return this.target.classList.contains('js-toggle-link')
    }

    this.clickedOnHeading = function () {
      return this.target.classList.contains('js-step-title-text')
    }

    this.iconType = function () {
      return (stepView.isHidden() ? 'Minus' : 'Plus')
    }

    this.isOptional = function () {
      return (this.stepIsOptional ? ' ; optional' : '')
    }
  }

  AppStepNav.prototype.ComponentLinkClick = function (event, stepNavTracker, linkPosition, size) {
    this.size = size
    this.target = event.target

    this.trackClick = function () {
      var trackingOptions = { label: this.target.getAttribute('href') + ' : ' + this.size }
      var dimension28 = this.target.closest('.app-step-nav__list').getAttribute('data-length')

      if (dimension28) {
        trackingOptions.dimension28 = dimension28
      }

      stepNavTracker.trackClick('stepNavLinkClicked', linkPosition, trackingOptions)
    }
  }

  // A helper that sends a custom event request to Google Analytics if
  // the GOVUK module is setup
  AppStepNav.prototype.StepNavTracker = function (uniqueId, totalSteps, totalLinks) {
    this.totalSteps = totalSteps
    this.totalLinks = totalLinks
    this.uniqueId = uniqueId

    this.trackClick = function (category, action, options) {
      // dimension26 records the total number of expand/collapse steps in this step nav
      // dimension27 records the total number of links in this step nav
      // dimension28 records the number of links in the step that was shown/hidden (handled in click event)
      if (window.GOVUK.analytics && window.GOVUK.analytics.trackEvent) {
        options = options || {}
        options.dimension26 = options.dimension26 || this.totalSteps.toString()
        options.dimension27 = options.dimension27 || this.totalLinks.toString()
        options.dimension96 = options.dimension96 || this.uniqueId
        window.GOVUK.analytics.trackEvent(category, action, options)
      }
    }
  }

  Modules.AppStepNav = AppStepNav
})(window.GOVUK.Modules)