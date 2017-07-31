;(function (global) {
  'use strict'

  var GOVUK = global.GOVUK || {}
  var $ = global.jQuery

  // Number polyfill. See guidance in docs when to use this polyfill
  // 1. Stops incrementing number input with up/down keys
  // 2. Enforces maxlength
  // 3. Stops typing of non-numeric characters
  GOVUK.numericInput = {
    $numberInput: $('[data-number-polyfill]'),

    bindUIEvents: function () {
      GOVUK.numericInput.$numberInput.keypress(function (event) {
        var $input = $(this)
        var inputType = GOVUK.numericInput.getInputType($input)

        if (!inputType) {
          return
        }
        var e = event || window.event

        if (inputType === 'number') {
          // GOVUK.numericInput.checkIfMaxLengthExceeded($input, e)
          GOVUK.numericInput.removeNonNumeric($input, e)
        }

        if (inputType === 'text' || inputType === 'tel') {
          GOVUK.numericInput.removeNonNumeric($input, e)
        }
      })

      GOVUK.numericInput.$numberInput.keydown(function (e) {
        var $input = $(this)
        var inputType = GOVUK.numericInput.getInputType($input)

        if (inputType === 'number') {
          GOVUK.numericInput.checkIfMaxLengthExceeded($input, e)
          GOVUK.numericInput.preventUpDownArrows($input, e)
        }
      })
    },
    removeNonNumeric: function ($el, e) {
      var numbers = []
      var key = e.keyCode || e.charCode

      if (!key) {
        return
      }

      for (var i = 48; i < 58; i++) {
        numbers.push(i)
      }

      var allAllowed = GOVUK.numericInput.allowedKeys.concat(numbers)

      if (!($.inArray(key, allAllowed) >= 0)) {
        console.log('non numeric')
        e.preventDefault()
      }
    },
    checkIfMaxLengthExceeded: function ($el, e) {
      var maxLength = $el.attr('maxlength')
      var value = $el.val()
      var isAllowed = true
      var key = e.keyCode || e.charCode

      if (!key) {
        return
      }

      if (maxLength !== undefined && maxLength > 0 && value && value.length >= maxLength) {
        console.log('over!!')
        isAllowed = false
      }

      $.each(GOVUK.numericInput.allowedKeys, function (i, e) {
        if (e === key) {
          isAllowed = true
        }
      })

      if (!isAllowed) {
        console.log('max length exceeded')
        e.preventDefault()
        return false
      }
    },
    preventUpDownArrows: function ($el, e) {
      if (!$el.data('number-arrow-nav')) {
        var key = e.keyCode || e.charCode

        if (!key) {
          return
        }

        if (e.keyCode === 38 || e.keyCode === 40) { // Up and down arrow
          console.log('up down key pressed')
          e.preventDefault()
        }
      }
    },
    allowedKeys : [
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
    ],
    getInputType: function ($el) {
      var inputType

      if ($el.attr('type') === 'number') {
        inputType = 'number'
      } else if ($el.attr('type') === 'text') {
        inputType = 'text'
      } else if ($el.attr('type') === 'tel') {
        inputType = 'tel'
      } else {
        console.log('Use data-number-polyfill on number, text or tel field!')
      }
      return inputType
    },
    init: function ($element) {
      GOVUK.numericInput.bindUIEvents()
    }
  }
  global.GOVUK = GOVUK
})(window); // eslint-disable-line semi
