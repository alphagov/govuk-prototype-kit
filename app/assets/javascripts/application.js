/* global $ */
/* global GOVUK */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  // Use GOV.UK shim-links-with-button-role.js to trigger a link styled to look like a button,
  // with role="button" when the space key is pressed.
  GOVUK.shimLinksWithButtonRole.init()

  // Show and hide toggled content
  // Where .multiple-choice uses the data-target attribute
  // to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()

  numberPolyfill.init()
})

// Number input polyfill prototype
var numberPolyfill = (function () {
  config = {
    $numberInputs: $('[data-number-polyfill]')
  }

  function init () {
    bindUIElements()
  }

  function bindUIElements () {

    config.$numberInputs.keydown(function(event) {

      var $input = $(this);
      var inputType = getInputType($input);

      if (!inputType) {
        return;
      }

      var e = event || window.event;

      if (inputType === 'number') {
        checkIfMaxLengthExceeded($input, e)
        preventUpDownArrows($input, e);        
      }
           
    });   
  }

  function getInputType($el) {
    var inputType;

    if($el.attr( 'type' ) === 'number' ) {
        inputType = 'number';
    } else if( $el.attr( 'type' ) === 'text' ) {
      inputType = 'text';
    } else {
      console.log('Use data-number-polyfill on number or text field!')
    }
    return inputType;
  }

  function checkIfMaxLengthExceeded($el, e) {
    var maxLength = $el.attr( 'maxlength');
    var value = $el.val();
    var isAllowed = true    
    var key = e.keyCode
    var allowedKeys = [
      8, // Backspace
      9, // Tab
      13, // Enter
      27, // Escape
      33, // Pgupå
      34, // Pgdown
      35, // End
      36, // Home
      37, // ArrowLeft
      38, // ArrowUp
      39, // ArrowRight
      40, // ArrowDown
      46 // Delete
    ];

    if (maxLength !== undefined && maxLength > 0 && value && value.length >= maxLength ) {
      console.log('over!!')
      isAllowed = false;
    }

    $.each(allowedKeys, function(i, e){
      if( e === key ) {
        isAllowed = true;
      }
    });

    if (!isAllowed) {
      e.preventDefault();
    }
  }

  function preventUpDownArrows($el, e) {

    if (!$el.data( 'number-arrow-nav')) {

      if (e.keyCode == '38' || e.keyCode == '40') { //Up and down arrow
        e.preventDefault()
      }
    }
  }

  return {
    init: init
  }
})()

//Helpers
var helper = {

    debounce: function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
};
