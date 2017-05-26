/* global $ */
/* global GOVUK */

// Warn about using the kit in production
if (
  window.sessionStorage && window.sessionStorage.getItem('prototypeWarning') !== 'false' &&
  window.console && window.console.info
) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
  window.sessionStorage.setItem('prototypeWarning', true)
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

  // scroll to selected chapter in sidebar
  var scrollto = location.search
  if (scrollto.length) {
    var found = scrollto.search('anchor')
    if (found != -1) {
      scrollto = scrollto.substring(found + 'anchor='.length)
      var parentEl = $('#navwrapper')
      var targetEl = $('#' + scrollto)
      var offset = targetEl.position()
      parentEl.scrollTop(offset.top)
    }
  }

  // begin the hacky
  $('#logo').attr('href', '/')

  // continue the hacky
  if ($('#definitelyUnique').length) {
    var deep = window.location.search
    console.log(deep)
    if (!deep.length) {
      $('#panel').hide()
    } else if (deep.search('showDeepNav') != -1) {
      $('html, body').animate({
        scrollTop: $('#definitelyUnique').offset().top
      }, 0)
    }
  }
})
