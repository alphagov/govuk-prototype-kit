;(function (global) {
  'use strict'

  var GOVUK = global.GOVUK || {}
  var $ = global.jQuery

  // Number polyfill
  //Adds features absent from the browser specs:
  //1. Stop incrementing number input with up/down keys
  //2. etc
  //Guidance in docs on when to use this polyfill
  GOVUK.numericInput = {
    $numberInputs: $('[data-number-polyfill]'),

    bindUIElements: function () {
      GOVUK.numericInput.$numberInputs.keydown(function (event) {
        var $input = $(this)
        var inputType = GOVUK.numericInput.getInputType($input)

        if (!inputType) {
          return
        }
        var e = event || window.event

        if (inputType === 'number') {
          GOVUK.numericInput.checkIfMaxLengthExceeded($input, e)
          GOVUK.numericInput.preventUpDownArrows($input, e)
        }
      })
    },
    getInputType: function ($el) {
      var inputType

      if ($el.attr('type') === 'number') {
        inputType = 'number'
      } else if ($el.attr('type') === 'text') {
        inputType = 'text'
      } else {
        console.log('Use data-number-polyfill on number or text field!')
      }
      return inputType
    },
    checkIfMaxLengthExceeded: function ($el, e) {
      var maxLength = $el.attr('maxlength')
      var value = $el.val()
      var isAllowed = true
      var key = e.keyCode
      var allowedKeys = [
        8, // Backspace
        9, // Tab
        13, // Enter
        27, // Escape
        33, // Pgup
        34, // Pgdown
        35, // End
        36, // Home
        37, // ArrowLeft
        38, // ArrowUp
        39, // ArrowRight
        40, // ArrowDown
        46 // Delete
      ]

      if (maxLength !== undefined && maxLength > 0 && value && value.length >= maxLength) {
        console.log('over!!')
        isAllowed = false
      }

      $.each(allowedKeys, function (i, e) {
        if (e === key) {
          isAllowed = true
        }
      })

      if (!isAllowed) {
        e.preventDefault()
      }
    },
    preventUpDownArrows: function ($el, e) {
      if (!$el.data('number-arrow-nav')) {
        // debugger
        if (e.keyCode === 38 || e.keyCode === 40) { // Up and down arrow
          e.preventDefault()
        }
      }
    },
    init: function ($element) {
      GOVUK.numericInput.bindUIElements()
    }
  }
  global.GOVUK = GOVUK
})(window); // eslint-disable-line semi
