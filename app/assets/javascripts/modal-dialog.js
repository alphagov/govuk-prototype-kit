;(function (global) {
  'use strict'

  var GOVUK = global.GOVUK || {}
  var $ = global.jQuery

  // Modal dialog prototype
  // NB: Will look for #content for toggling inert state
  GOVUK.modalDialog = {
    dialog: document.getElementById('js-prototype-warning-dialog'),
    dialogTouchArea: $('.prototype-warning-dialog .js-dialog-touch-area'),
    lastFocusedEl: null,
    openButton: $('#openModal'),
    closeButton: $('.prototype-warning-dialog .js-dialog-close'),
    firstTabbable: $('.js-dialog-first-tabbable'),
    lastTabbable: $('.js-dialog-last-tabbable'),

    bindUIElements: function () {
      GOVUK.modalDialog.openButton.on('click', function (e) {
        GOVUK.modalDialog.openDialog()
        return false
      })

      GOVUK.modalDialog.closeButton.on('click', function (e) {
        e.preventDefault()
        console.log('Prototype warning dialog dismissed')
        GOVUK.modalDialog.closeDialog()
      })
    },
    startTimer: function () {
      var $element = $('.timer')
      var $accessibleElement = $('.at-timer')
      var minutes = $element.data('minutes')
      var seconds = 60 * minutes

      $element.text(minutes + ' minute' + (minutes > 1 ? 's' : ''));

      (function runTimer () {
        var minutesLeft = parseInt(seconds / 60, 10)
        var secondsLeft = parseInt(seconds % 60, 10)
        var timerExpired = minutesLeft < 1 && secondsLeft < 1

        var minutesText = minutesLeft > 0 ? minutesLeft + ' minute' + (minutesLeft > 1 ? 's' : '') + ' ' : ''
        var secondsText = secondsLeft >= 1 ? secondsLeft + ' second' + (secondsLeft > 1 ? 's' : '') + ' ' : '' // to do: plural for seconds

        var text = 'You will be redirected in ' + minutesText + secondsText

        if (timerExpired) {
          $element.text('You are about to be redirected')
          $accessibleElement.text('You are about to be redirected')
          setTimeout(GOVUK.modalDialog.redirect, 4000)
        } else {
          $element.text(text)

          seconds--

          if (minutesLeft < 1) {
             // if less than 20 seconds left, make aria-live assertive and update content every 5 secs
            if (secondsLeft < 20) {
              $accessibleElement.attr('aria-live', 'assertive')

              if (secondsLeft % 5 === 0) {
                $accessibleElement.text(text)
              }
            } else if (secondsLeft % 20 === 0) {
              // if less than 1 minute left, update screen reader friendly content every 20 secs
              $accessibleElement.text(text)
            }
          } else if (secondsLeft % 30 === 0) {
            // update screen reader friendly content every 30 secs
            $accessibleElement.text(text)
          }

          setTimeout(runTimer, 1000)
        }
      })()
    },
    redirect: function () {
      window.location.replace('https://www.gov.uk/')
    },
    isDialogOpen: function () {
      return GOVUK.modalDialog.dialog['open']
    },
    openDialog: function () {
      GOVUK.modalDialog.startTimer()
      GOVUK.modalDialog.lastFocusedEl = document.activeElement

      if (!GOVUK.modalDialog.lastFocusedEl || GOVUK.modalDialog.lastFocusedEl === document.body) {
        GOVUK.modalDialog.lastFocusedEl = null
      } else if (document.querySelector) {
        GOVUK.modalDialog.lastFocusedEl = document.querySelector(':focus')
      }
      console.log('Showing prototype warning')
      $('html, body').addClass('dialog-is-open')

      if (document.querySelector('#content')) {
        document.querySelector('#content').inert = true
      }

      GOVUK.modalDialog.dialog.showModal()
    },
    closeDialog: function () {
      // to do: remove timer here
      if (GOVUK.modalDialog.isDialogOpen()) {
        GOVUK.modalDialog.dialog.close()
        GOVUK.cookie('prototype_warning_dialog_seen', 'true', { expires: 30 })
        $('html, body').removeClass('dialog-is-open')

        if (GOVUK.modalDialog.lastFocusedEl) {
          window.setTimeout(function () {
            GOVUK.modalDialog.lastFocusedEl.focus()
          }, 0)
        }
        if (document.querySelector('#content')) {
          document.querySelector('#content').inert = false
        }
      }
    },
    escClose: function () {
      $(document).keydown(function (e) {
        if (GOVUK.modalDialog.isDialogOpen() && e.keyCode === 27) {
          GOVUK.modalDialog.closeDialog()
        }
      })
    },
    init: function ($element) {
      if (GOVUK.modalDialog.dialog) {
         // Register dialog for polyfill
        window.dialogPolyfill.registerDialog(GOVUK.modalDialog.dialog)

        // if (config.prototype_warning != 'true') { //removed cookie checking for debugging
        setTimeout(GOVUK.modalDialog.openDialog, 3000)
        // }
        GOVUK.modalDialog.bindUIElements()
        GOVUK.modalDialog.escClose()
      }
    }
  }
  global.GOVUK = GOVUK
})(window); // eslint-disable-line semi
