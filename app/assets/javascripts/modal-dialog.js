;(function (global) {
  'use strict'

  var GOVUK = global.GOVUK || {}
  var $ = global.jQuery

  // Modal dialog prototype
  GOVUK.modalDialog = {
    el: document.getElementById('js-modal-dialog'),
    $el: $('#js-modal-dialog'),
    $lastFocusedEl: null,
    $openButton: $('#openModal'),
    $closeButton: $('.modal-dialog .js-dialog-close'),
    dialogIsOpenClass: 'dialog-is-open',
    timers: [],
    // Timer specific markup. If these are not present, timeout and redirection are disabled
    $timer: $('#js-modal-dialog .timer'),
    $accessibleTimer: $('#js-modal-dialog .at-timer'),
    // Timer specific settings. If these are not set, timeout and redirection are disabled
    idleMinutesBeforeTimeOut: $('#js-modal-dialog').data('minutes-idle-timeout'),
    timeOutRedirectUrl: $('#js-modal-dialog').data('url-redirect'),
    minutesTimeOutModalVisible: $('#js-modal-dialog').data('minutes-modal-visible'),

    bindUIElements: function () {
      GOVUK.modalDialog.$openButton.on('click', function (e) {
        GOVUK.modalDialog.openDialog()
        return false
      })
      GOVUK.modalDialog.$closeButton.on('click', function (e) {
        e.preventDefault()
        GOVUK.modalDialog.closeDialog()
      })
    },
    isDialogOpen: function () {
      return GOVUK.modalDialog.el['open']
    },
    isTimerSet: function () {
      return GOVUK.modalDialog.$timer.length > 0 && GOVUK.modalDialog.$accessibleTimer.length > 0 && GOVUK.modalDialog.idleMinutesBeforeTimeOut && GOVUK.modalDialog.minutesTimeOutModalVisible && GOVUK.modalDialog.timeOutRedirectUrl
    },
    openDialog: function () {
      if (!GOVUK.modalDialog.isDialogOpen()) {
        $('html, body').addClass(GOVUK.modalDialog.dialogIsOpenClass)
        GOVUK.modalDialog.saveLastFocusedEl()
        GOVUK.modalDialog.makePageContentInert()
        GOVUK.modalDialog.el.showModal()

        if (GOVUK.modalDialog.isTimerSet()) {
          GOVUK.modalDialog.startTimer()
        }
      }
    },
    closeDialog: function () {
      if (GOVUK.modalDialog.isDialogOpen()) {
        $('html, body').removeClass(GOVUK.modalDialog.dialogIsOpenClass)
        GOVUK.modalDialog.el.close()
        GOVUK.modalDialog.setFocusOnLastFocusedEl()
        GOVUK.modalDialog.removeInertFromPageContent()

        if (GOVUK.modalDialog.isTimerSet()) {
          GOVUK.modalDialog.clearTimers()
        }
      }
    },
    saveLastFocusedEl: function () {
      GOVUK.modalDialog.$lastFocusedEl = document.activeElement
      if (!GOVUK.modalDialog.$lastFocusedEl || GOVUK.modalDialog.$lastFocusedEl === document.body) {
        GOVUK.modalDialog.$lastFocusedEl = null
      } else if (document.querySelector) {
        GOVUK.modalDialog.$lastFocusedEl = document.querySelector(':focus')
      }
    },
    // Set focus back on last focused el when modal closed
    setFocusOnLastFocusedEl: function () {
      if (GOVUK.modalDialog.$lastFocusedEl) {
        window.setTimeout(function () {
          GOVUK.modalDialog.$lastFocusedEl.focus()
        }, 0)
      }
    },
    // Set page content to inert to indicate to screenreaders it's inactive
    // NB: This will look for #content for toggling inert state
    makePageContentInert: function () {
      if (document.querySelector('#content')) {
        document.querySelector('#content').inert = true
      }
    },
    // Make page content active when modal is not open
    // NB: This will look for #content for toggling inert state
    removeInertFromPageContent: function () {
      if (document.querySelector('#content')) {
        document.querySelector('#content').inert = false
      }
    },
    // Starts a timer. If modal not closed before time out + 4 seconds grace period, user is redirected.
    startTimer: function () {
      GOVUK.modalDialog.clearTimers() // Clear any other modal timers that might have been running
      var $timer = GOVUK.modalDialog.$timer
      var $accessibleTimer = GOVUK.modalDialog.$accessibleTimer
      var minutes = GOVUK.modalDialog.minutesTimeOutModalVisible

      if (minutes) {
        var seconds = 60 * minutes

        $timer.text(minutes + ' minute' + (minutes > 1 ? 's' : ''));

        (function runTimer () {
          var minutesLeft = parseInt(seconds / 60, 10)
          var secondsLeft = parseInt(seconds % 60, 10)
          var timerExpired = minutesLeft < 1 && secondsLeft < 1

          var minutesText = minutesLeft > 0 ? minutesLeft + ' minute' + (minutesLeft > 1 ? 's' : '') + ' ' : ''
          var secondsText = secondsLeft >= 1 ? secondsLeft + ' second' + (secondsLeft > 1 ? 's' : '') + ' ' : ''

          var text = 'You will be redirected in ' + minutesText + secondsText

          if (timerExpired) {
            $timer.text('You are about to be redirected')
            $accessibleTimer.text('You are about to be redirected')
            setTimeout(GOVUK.modalDialog.redirect, 4000)
          } else {
            $timer.text(text)

            seconds--

            if (minutesLeft < 1) {
               // If less than 20 seconds left, make aria-live assertive and update content every 5 secs
              if (secondsLeft < 20) {
                $accessibleTimer.attr('aria-live', 'assertive')

                if (secondsLeft % 5 === 0) {
                  $accessibleTimer.text(text)
                }
              } else if (secondsLeft % 20 === 0) {
                // If less than 1 minute left, update screen reader friendly content every 20 secs
                $accessibleTimer.text(text)
              }
            } else if (secondsLeft % 30 === 0) {
              // Update screen reader friendly content every 30 secs
              $accessibleTimer.text(text)
            }
            // JS won't doesn't allow resetting timers globally so timers need to be retained for resetting.
            GOVUK.modalDialog.timers.push(setTimeout(runTimer, 1000))
          }
        })()
      }
    },
    // Clears modal timer.
    clearTimers: function () {
      for (var i = 0; i < GOVUK.modalDialog.timers.length; i++) {
        clearTimeout(GOVUK.modalDialog.timers[i])
      }
    },
    // Close modal when ESC pressed
    escClose: function () {
      $(document).keydown(function (e) {
        if (GOVUK.modalDialog.isDialogOpen() && e.keyCode === 27) {
          GOVUK.modalDialog.closeDialog()
        }
      })
    },
    // Show modal after period of user inactivity
    idleTimeOut: function () {
      var idleMinutes = GOVUK.modalDialog.idleMinutesBeforeTimeOut
      var milliSeconds
      var timer

      if (idleMinutes) {
        milliSeconds = idleMinutes * 60000

        window.onload = resetTimer
        window.onmousemove = resetTimer
        window.onmousedown = resetTimer // Catches touchscreen presses
        window.onclick = resetTimer     // Catches touchpad clicks
        window.onscroll = resetTimer    // Catches scrolling with arrow keys
        window.onkeypress = resetTimer
      }

      function resetTimer () {
        clearTimeout(timer)
        timer = setTimeout(GOVUK.modalDialog.openDialog, milliSeconds)
      }
    },
    redirect: function () {
      window.location.replace(GOVUK.modalDialog.timeOutRedirectUrl)
    },
    init: function () {
      if (GOVUK.modalDialog.el) {
        // Native dialog is not supported by browser so use polyfill
        if (typeof HTMLDialogElement !== 'function') {
          window.dialogPolyfill.registerDialog(GOVUK.modalDialog.el)
        }
        GOVUK.modalDialog.bindUIElements()
        GOVUK.modalDialog.escClose()

        if (GOVUK.modalDialog.isTimerSet()) {
          GOVUK.modalDialog.idleTimeOut()
        }
      }
    }
  }
  global.GOVUK = GOVUK
})(window); // eslint-disable-line semi
