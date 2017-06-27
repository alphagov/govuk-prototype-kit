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
  modalDialog.init()
})



// Modal dialog prototype
// NB: This relies on having a #content element for the main content
var modalDialog = (function () {
  config = {
    dialog: document.getElementById('js-prototype-warning-dialog'),
    dialogTouchArea: $('.prototype-warning-dialog .js-dialog-touch-area'),
    lastFocusedEl: null,
    openButton: $('#openModal'),
    closeButton: $('.prototype-warning-dialog .js-dialog-close'),
    firstTabbable: $('.js-dialog-first-tabbable'),
    lastTabbable: $('.js-dialog-last-tabbable')
  }

  function init () {

    //debugger;

    if (config.dialog) {

       // Register dialog for polyfill

        //debugger;
        dialogPolyfill.registerDialog(config.dialog);

        //if (config.prototype_warning != 'true') { //removed cookie checking for debugging
         setTimeout(openDialog, 3000);
        //}
        bindUIElements()
        escClose()

    }

   
  }

  function bindUIElements () {

    config.openButton.on('click', function(e) {
      openDialog()
      return false 
    })

    config.closeButton.on('click', function (e) {
      e.preventDefault()
      console.log('Prototype warning dialog dismissed')
      closeDialog()
    })
  }

  function startTimer() {
    var $element = $('.timer')
    var $elementContainer
    var $accessibleElement = $('.at-timer')
    var minutes = $element.data('minutes')
    var seconds = 60 * minutes

    seconds = 5

    $element.text(minutes + ' minute' + (minutes > 1 ? 's' : ''));

    (function runTimer() {
      var minutesLeft = parseInt(seconds / 60, 10)
      var secondsLeft = parseInt(seconds % 60, 10)
      var timerExpired = minutesLeft < 1 && secondsLeft < 0

      //debugger;

      var minutesText = minutesLeft > 0 ? minutesLeft + " minute" + (minutesLeft > 1 ? "s" : "") + " " : ""
      var secondsText = secondsLeft > 1 ? secondsLeft + " seconds" : "" //to do: plural for seconds

      //debugger

      var text =  'You will be redirected in ' + minutesText + secondsText

      if (timerExpired) {
        $element.text('You are about to be redirected')
        $accessibleElement.text('You are about to be redirected')
        //setTimeout(redirect, 4000)
      } else {
        $element.text(text)

        if (minutesLeft < 1) {

           //if less than 20 seconds left, make aria-live assertive and update content every 5 secs
          if (secondsLeft < 20) {
            $accessibleElement.attr('aria-live', 'assertive');

            if (secondsLeft % 5 === 0) {
              $accessibleElement.text(text)
            }
          } else if (secondsLeft % 20 === 0) {
            //if less than 1 minute left, update screen reader friendly content every 20 secs
            $accessibleElement.text(text)
          }
          
        } else if (secondsLeft % 30 === 0) {
          //update screen reader friendly content every 30 secs
          $accessibleElement.text(text)
        }

        debugger;

        seconds--
        setTimeout(runTimer, 1000)
      }
    })()
  }


  function redirect() {
    window.location.replace('https://www.gov.uk/')
  }

  function isDialogOpen() {
   return config.dialog['open']
  }

  function openDialog () {

    startTimer() 

    config.lastFocusedEl = document.activeElement;

    if (!config.lastFocusedEl  || config.lastFocusedEl  == document.body)
        config.lastFocusedEl  = null;

    else if (document.querySelector)
        config.lastFocusedEl  = document.querySelector(":focus");

      console.log('Showing prototype warning')
      $('html, body').addClass('dialog-is-open')
      document.querySelector('#content').inert = true
      config.dialog.showModal()
    }

  function closeDialog () {

    //remove timer

    debugger;

    if (isDialogOpen()) {
      config.dialog.close()
      GOVUK.cookie('prototype_warning_dialog_seen', 'true', { expires: 30 })
      $('html, body').removeClass('dialog-is-open')

      if ( config.lastFocusedEl ) {   

        window.setTimeout(function () { 
            config.lastFocusedEl.focus()
        }, 0); 
      }

      document.querySelector('#content').inert = false
    }   
  }

  function escClose() {

    $(document).keydown(function(e) {
     if (isDialogOpen() && e.keyCode == 27) { 
        closeDialog()
      }
    });

  }

  return {
    init: init
  }
})()