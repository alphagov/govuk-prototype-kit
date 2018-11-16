/* global $, GOVUK, history, sessionStorage  */

// based on https://github.com/alphagov/govuk_publishing_components/blob/v9.3.6/app/assets/javascripts/govuk_publishing_components/components/step-by-step-nav.js

window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {}
window.GOVUK.support = window.GOVUK.support || {}

window.GOVUK.support.history = function () {
  return window.history && window.history.pushState && window.history.replaceState
}

window.GOVUK.getCurrentLocation = function () {
  return window.location
};

(function (Modules) {
  'use strict'

  Modules.StepByStepNavigation = function () {
    var actions = {} // stores text for JS appended elements 'show' and 'hide' on steps, and 'show/hide all' button
    var rememberShownStep = false
    var sessionStoreLink = 'govuk-step-nav-active-link'
    var activeLinkClass = 'app-step-nav__list-item--active'
    var activeLinkHref = '#content'

    this.start = function ($element) {
      $(window).unload(storeScrollPosition)

      // Indicate that js has worked
      $element.addClass('app-step-nav--active')

      // Prevent FOUC, remove class hiding content
      $element.removeClass('js-hidden')

      rememberShownStep = !!$element.filter('[data-remember]').length
      var $steps = $element.find('.js-step')
      var $stepHeaders = $element.find('.js-toggle-panel')
      var totalSteps = $element.find('.js-panel').length

      var $showOrHideAllButton

      getTextForInsertedElements()
      addButtonstoSteps()
      addShowHideAllButton()
      addShowHideToggle()
      addAriaControlsAttrForShowHideAllButton()

      hideAllSteps()
      showLinkedStep()
      ensureOnlyOneActiveLink()

      bindToggleForSteps()
      bindToggleShowHideAllButton()
      bindComponentLinkClicks()

      function getTextForInsertedElements () {
        actions.showText = $element.attr('data-show-text')
        actions.hideText = $element.attr('data-hide-text')
        actions.showAllText = $element.attr('data-show-all-text')
        actions.hideAllText = $element.attr('data-hide-all-text')
      }

      // When navigating back in browser history to the step nav, the browser will try to be "clever" and return
      // the user to their previous scroll position. However, since we collapse all but the currently-anchored
      // step, the content length changes and the user is returned to the wrong position (often the footer).
      // In order to correct this behaviour, as the user leaves the page, we anticipate the correct height we wish the
      // user to return to by forcibly scrolling them to that height, which becomes the height the browser will return
      // them to.
      // If we can't find an element to return them to, then reset the scroll to the top of the page. This handles
      // the case where the user has expanded all steps, so they are not returned to a particular step, but
      // still could have scrolled a long way down the page.
      function storeScrollPosition () {
        hideAllSteps()
        var $step = getStepForAnchor()

        document.body.scrollTop = $step && $step.length
          ? $step.offset().top
          : 0
      }

      function addShowHideAllButton () {
        $element.prepend('<div class="app-step-nav__controls"><button aria-expanded="false" class="app-step-nav__button app-step-nav__button--controls js-step-controls-button">' + actions.showAllText + '</button></div>')
      }

      function addShowHideToggle () {
        $stepHeaders.each(function () {
          var linkText = actions.showText

          if (headerIsOpen($(this))) {
            linkText = actions.hideText
          }
          if (!$(this).find('.js-toggle-link').length) {
            $(this).find('.js-step-title-button').append('<span class="app-step-nav__toggle-link js-toggle-link" aria-hidden="true">' + linkText + '</span>')
          }
        })
      }

      function headerIsOpen ($stepHeader) {
        return (typeof $stepHeader.closest('.js-step').data('show') !== 'undefined')
      }

      function addAriaControlsAttrForShowHideAllButton () {
        var ariaControlsValue = $element.find('.js-panel').first().attr('id')

        $showOrHideAllButton = $element.find('.js-step-controls-button')
        $showOrHideAllButton.attr('aria-controls', ariaControlsValue)
      }

      function hideAllSteps () {
        setAllStepsShownState(false)
      }

      function setAllStepsShownState (isShown) {
        $.each($steps, function () {
          var stepView = new StepView($(this))
          stepView.preventHashUpdate()
          stepView.setIsShown(isShown)
        })
      }

      function showLinkedStep () {
        var $step
        if (rememberShownStep) {
          $step = getStepForAnchor()
        } else {
          $step = $steps.filter('[data-show]')
        }

        if ($step && $step.length) {
          var stepView = new StepView($step)
          stepView.show()
        }
      }

      function getStepForAnchor () {
        var anchor = getActiveAnchor()

        return anchor.length
          ? $element.find('#' + escapeSelector(anchor.substr(1)))
          : null
      }

      function getActiveAnchor () {
        return GOVUK.getCurrentLocation().hash
      }

      function addButtonstoSteps () {
        $.each($steps, function () {
          var $step = $(this)
          var $title = $step.find('.js-step-title')
          var contentId = $step.find('.js-panel').first().attr('id')

          $title.wrapInner(
            '<span class="js-step-title-text"></span>'
          )

          $title.wrapInner(
            '<button ' +
            'class="app-step-nav__button app-step-nav__button--title js-step-title-button" ' +
            'aria-expanded="false" aria-controls="' + contentId + '">' +
            '</button>'
          )
        })
      }

      function bindToggleForSteps () {
        $element.find('.js-toggle-panel').click(function (event) {
          var $step = $(this).closest('.js-step')

          var stepView = new StepView($step)
          stepView.toggle()

          setShowHideAllText()
        })
      }

      // tracking click events on links in step content
      function bindComponentLinkClicks () {
        $element.find('.js-link').click(function (event) {
          var thisLinkHref = $(this).attr('href')

          if ($(this).attr('rel') !== 'external') {
            saveToSessionStorage(sessionStoreLink, $(this).data('position'))
          }

          if (thisLinkHref === activeLinkHref) {
            setOnlyThisLinkActive($(this))
          }
        })
      }

      function saveToSessionStorage (key, value) {
        sessionStorage.setItem(key, value)
      }

      function loadFromSessionStorage (key) {
        return sessionStorage.getItem(key)
      }

      function removeFromSessionStorage (key) {
        sessionStorage.removeItem(key)
      }

      function setOnlyThisLinkActive (clicked) {
        $element.find('.' + activeLinkClass).removeClass(activeLinkClass)
        clicked.parent().addClass(activeLinkClass)
      }

      function ensureOnlyOneActiveLink () {
        var $activeLinks = $element.find('.js-list-item.' + activeLinkClass)

        if ($activeLinks.length <= 1) {
          return
        }

        var lastClicked = loadFromSessionStorage(sessionStoreLink)

        if (lastClicked) {
          removeActiveStateFromAllButCurrent($activeLinks, lastClicked)
          removeFromSessionStorage(sessionStoreLink)
        } else {
          var activeLinkInActiveStep = $element.find('.app-step-nav__step--active').find('.' + activeLinkClass).first()

          if (activeLinkInActiveStep.length) {
            $activeLinks.removeClass(activeLinkClass)
            activeLinkInActiveStep.addClass(activeLinkClass)
          } else {
            $activeLinks.slice(1).removeClass(activeLinkClass)
          }
        }
      }

      function removeActiveStateFromAllButCurrent ($links, current) {
        $links.each(function () {
          if ($(this).find('.js-link').data('position').toString() !== current.toString()) {
            $(this).removeClass(activeLinkClass)
          }
        })
      }

      function bindToggleShowHideAllButton () {
        $showOrHideAllButton = $element.find('.js-step-controls-button')
        $showOrHideAllButton.on('click', function () {
          var shouldshowAll

          if ($showOrHideAllButton.text() === actions.showAllText) {
            $showOrHideAllButton.text(actions.hideAllText)
            $element.find('.js-toggle-link').text(actions.hideText)
            shouldshowAll = true
          } else {
            $showOrHideAllButton.text(actions.showAllText)
            $element.find('.js-toggle-link').text(actions.showText)
            shouldshowAll = false
          }

          setAllStepsShownState(shouldshowAll)
          $showOrHideAllButton.attr('aria-expanded', shouldshowAll)
          setShowHideAllText()
          setHash(null)

          return false
        })
      }

      function setShowHideAllText () {
        var shownSteps = $element.find('.step-is-shown').length
        // Find out if the number of is-opens == total number of steps
        if (shownSteps === totalSteps) {
          $showOrHideAllButton.text(actions.hideAllText)
        } else {
          $showOrHideAllButton.text(actions.showAllText)
        }
      }

      // Ideally we'd use jQuery.escapeSelector, but this is only available from v3
      // See https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/selector-native.js#L46
      function escapeSelector (s) {
        var cssMatcher = /([\x00-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g // eslint-disable-line no-control-regex
        return s.replace(cssMatcher, '\\$&')
      }
    }

    function StepView ($stepElement) {
      var $titleLink = $stepElement.find('.js-step-title-button')
      var $stepContent = $stepElement.find('.js-panel')
      var shouldUpdateHash = rememberShownStep

      this.title = $stepElement.find('.js-step-title-text').text().trim()
      this.element = $stepElement

      this.show = show
      this.hide = hide
      this.toggle = toggle
      this.setIsShown = setIsShown
      this.isShown = isShown
      this.isHidden = isHidden
      this.preventHashUpdate = preventHashUpdate
      this.numberOfContentItems = numberOfContentItems

      function show () {
        setIsShown(true)
      }

      function hide () {
        setIsShown(false)
      }

      function toggle () {
        setIsShown(isHidden())
      }

      function setIsShown (isShown) {
        $stepElement.toggleClass('step-is-shown', isShown)
        $stepContent.toggleClass('js-hidden', !isShown)
        $titleLink.attr('aria-expanded', isShown)
        $stepElement.find('.js-toggle-link').text(isShown ? actions.hideText : actions.showText)

        if (shouldUpdateHash) {
          updateHash($stepElement)
        }
      }

      function isShown () {
        return $stepElement.hasClass('step-is-shown')
      }

      function isHidden () {
        return !isShown()
      }

      function preventHashUpdate () {
        shouldUpdateHash = false
      }

      function numberOfContentItems () {
        return $stepContent.find('.js-link').length
      }
    }

    function updateHash ($stepElement) {
      var stepView = new StepView($stepElement)
      var hash = stepView.isShown() && '#' + $stepElement.attr('id')
      setHash(hash)
    }

    // Sets the hash for the page. If a falsy value is provided, the hash is cleared.
    function setHash (hash) {
      if (!GOVUK.support.history()) {
        return
      }

      var newLocation = hash || GOVUK.getCurrentLocation().pathname
      history.replaceState({}, '', newLocation)
    }
  }
})(window.GOVUK.Modules)
