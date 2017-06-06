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

  if ($('#contents').length) {
    var test = new StickyElementContainer()
    test.start($('#contentsSticky'))
  }
})

StickyElementContainer = function () {
  var self = this
  // var $ = root.$
  var $window = $(window)
/*
  var $ = root.$
  var $window = $(root)
*/
  self._getWindowDimensions = function _getWindowDimensions () {
    return {
      height: $window.height(),
      width: $window.width()
    }
  }

  self._getWindowPositions = function _getWindowPositions () {
    return {
      scrollTop: $window.scrollTop()
    }
  }

  self.start = function start ($el) {
    var $element = $el.find('[data-sticky-element]')
    var _hasResized = true
    var _hasScrolled = true
    var _interval = 50
    var _windowVerticalPosition = 1
    var _startPosition, _stopPosition

    initialise()

    function initialise () {
      $window.resize(onResize)
      $window.scroll(onScroll)
      setInterval(checkResize, _interval)
      setInterval(checkScroll, _interval)
      checkResize()
      checkScroll()
      $element.addClass('govuk-sticky-element')
    }

    function onResize () {
      _hasResized = true
    }

    function onScroll () {
      _hasScrolled = true
    }

    function checkResize () {
      if (_hasResized) {
        _hasResized = false
        _hasScrolled = true

        var windowDimensions = self._getWindowDimensions()
        _startPosition = $el.offset().top
        _stopPosition = $el.offset().top + $el.height() - windowDimensions.height
      }
    }

    function checkScroll () {
      if (_hasScrolled) {
        _hasScrolled = false

        _windowVerticalPosition = self._getWindowPositions().scrollTop

        updateVisibility()
        updatePosition()
      }
    }

    function updateVisibility () {
      var isPastStart = _startPosition < _windowVerticalPosition
      if (isPastStart) {
        show()
      } else {
        hide()
      }
    }

    function updatePosition () {
      var isPastEnd = _stopPosition < _windowVerticalPosition
      if (isPastEnd) {
        stickToParent()
      } else {
        stickToWindow()
      }
    }

    function stickToWindow () {
      $element.addClass('govuk-sticky-element--stuck-to-window')
      $element.removeClass('govuk-sticky-element--stuck-to-parent')
    }

    function stickToParent () {
      $element.addClass('govuk-sticky-element--stuck-to-parent')
      $element.removeClass('govuk-sticky-element--stuck-to-window')
    }

    function show () {
      $element.removeClass('govuk-sticky-element--hidden')
    }

    function hide () {
      $element.addClass('govuk-sticky-element--hidden')
    }
  }
}
