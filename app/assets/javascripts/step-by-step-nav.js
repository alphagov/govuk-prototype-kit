// Based on https://github.com/alphagov/govuk_publishing_components/blob/v22.0.0/app/assets/javascripts/govuk_publishing_components/components/step-by-step-nav.js

/* eslint-env jquery */

window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

(function (Modules) {
  'use strict'

  Modules.AppStepNav = function () {
    var actions = {} // stores text for JS appended elements 'show' and 'hide' on steps, and 'show/hide all' button
    var rememberShownStep = false
    var stepNavSize
    var sessionStoreLink = 'govuk-step-nav-active-link'
    var activeLinkClass = 'app-step-nav__list-item--active'
    var activeStepClass = 'app-step-nav__step--active'
    var activeLinkHref = '#content'
    var uniqueId

    this.start = function ($element) {
      // Indicate that js has worked
      $element.addClass('app-step-nav--active')

      // Prevent FOUC, remove class hiding content
      $element.removeClass('js-hidden')

      stepNavSize = $element.hasClass('app-step-nav--large') ? 'Big' : 'Small'
      rememberShownStep = !!$element.filter('[data-remember]').length && stepNavSize === 'Big'
      var $steps = $element.find('.js-step')
      var $stepHeaders = $element.find('.js-toggle-panel')
      var totalSteps = $element.find('.js-panel').length
      var totalLinks = $element.find('app-step-nav__link').length
      var $showOrHideAllButton

      uniqueId = $element.data('id') || false

      if (uniqueId) {
        sessionStoreLink = sessionStoreLink + '_' + uniqueId
      }

      var stepNavTracker = new StepNavTracker(totalSteps, totalLinks, uniqueId)

      getTextForInsertedElements()
      addButtonstoSteps()
      addShowHideAllButton()
      addShowHideToggle()
      addAriaControlsAttrForShowHideAllButton()

      ensureOnlyOneActiveLink()
      showPreviouslyOpenedSteps()

      bindToggleForSteps(stepNavTracker)
      bindToggleShowHideAllButton(stepNavTracker)
      bindComponentLinkClicks(stepNavTracker)

      function getTextForInsertedElements () {
        actions.showText = $element.attr('data-show-text')
        actions.hideText = $element.attr('data-hide-text')
        actions.showAllText = $element.attr('data-show-all-text')
        actions.hideAllText = $element.attr('data-hide-all-text')
      }

      function addShowHideAllButton () {
        $element.prepend('<div class="app-step-nav__controls"><button aria-expanded="false" class="app-step-nav__button app-step-nav__button--controls js-step-controls-button">' + actions.showAllText + '</button></div>')
      }

      function addShowHideToggle () {
        $stepHeaders.each(function () {
          var linkText = actions.showText // eslint-disable-line no-unused-vars

          if (headerIsOpen($(this))) {
            linkText = actions.hideText
          }

          if (!$(this).find('.js-toggle-link').length) {
            $(this).find('.js-step-title-button').append(
              '<span class="app-step-nav__toggle-link js-toggle-link" aria-hidden="true" hidden></span>'
            )
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

      // called by show all/hide all, sets all steps accordingly
      function setAllStepsShownState (isShown) {
        var data = []

        $.each($steps, function () {
          var stepView = new StepView($(this))
          stepView.setIsShown(isShown)

          if (isShown) {
            data.push($(this).attr('id'))
          }
        })

        if (isShown) {
          saveToSessionStorage(uniqueId, JSON.stringify(data))
        } else {
          removeFromSessionStorage(uniqueId)
        }
      }

      // called on load, determines whether each step should be open or closed
      function showPreviouslyOpenedSteps () {
        var data = loadFromSessionStorage(uniqueId) || []

        $.each($steps, function () {
          var id = $(this).attr('id')
          var stepView = new StepView($(this))

          // show the step if it has been remembered or if it has the 'data-show' attribute
          if ((rememberShownStep && data.indexOf(id) > -1) || typeof $(this).attr('data-show') !== 'undefined') {
            stepView.setIsShown(true)
          } else {
            stepView.setIsShown(false)
          }
        })

        if (data.length > 0) {
          $showOrHideAllButton.attr('aria-expanded', true)
          setShowHideAllText()
        }
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

      function bindToggleForSteps (stepNavTracker) {
        $element.find('.js-toggle-panel').click(function (event) {
          var $step = $(this).closest('.js-step')

          var stepView = new StepView($step)
          stepView.toggle()

          var stepIsOptional = typeof $step.data('optional') !== 'undefined'
          var toggleClick = new StepToggleClick(event, stepView, $steps, stepNavTracker, stepIsOptional)
          toggleClick.track()

          setShowHideAllText()
          rememberStepState($step)
        })
      }

      // if the step is open, store its id in session store
      // if the step is closed, remove its id from session store
      function rememberStepState ($step) {
        if (rememberShownStep) {
          var data = JSON.parse(loadFromSessionStorage(uniqueId)) || []
          var thisstep = $step.attr('id')
          var shown = $step.hasClass('step-is-shown')

          if (shown) {
            data.push(thisstep)
          } else {
            var i = data.indexOf(thisstep)
            if (i > -1) {
              data.splice(i, 1)
            }
          }
          saveToSessionStorage(uniqueId, JSON.stringify(data))
        }
      }

      // tracking click events on links in step content
      function bindComponentLinkClicks (stepNavTracker) {
        $element.find('.js-link').click(function (event) {
          var linkClick = new componentLinkClick(event, stepNavTracker, $(this).attr('data-position')) // eslint-disable-line no-new, new-cap
          linkClick.track()
          var thisLinkHref = $(this).attr('href')

          if ($(this).attr('rel') !== 'external') {
            saveToSessionStorage(sessionStoreLink, $(this).attr('data-position'))
          }

          if (thisLinkHref === activeLinkHref) {
            setOnlyThisLinkActive($(this))
            setActiveStepClass()
          }
        })
      }

      function saveToSessionStorage (key, value) {
        window.sessionStorage.setItem(key, value)
      }

      function loadFromSessionStorage (key) {
        return window.sessionStorage.getItem(key)
      }

      function removeFromSessionStorage (key) {
        window.sessionStorage.removeItem(key)
      }

      function setOnlyThisLinkActive (clicked) {
        $element.find('.' + activeLinkClass).removeClass(activeLinkClass)
        clicked.parent().addClass(activeLinkClass)
      }

      // if a link occurs more than once in a step nav, the backend doesn't know which one to highlight
      // so it gives all those links the 'active' attribute and highlights the last step containing that link
      // if the user clicked on one of those links previously, it will be in the session store
      // this code ensures only that link and its corresponding step have the highlighting
      // otherwise it accepts what the backend has already passed to the component
      function ensureOnlyOneActiveLink () {
        var $activeLinks = $element.find('.js-list-item.' + activeLinkClass)

        if ($activeLinks.length <= 1) {
          return
        }

        var lastClicked = loadFromSessionStorage(sessionStoreLink) || $element.find('.' + activeLinkClass).first().attr('data-position')

        // it's possible for the saved link position value to not match any of the currently duplicate highlighted links
        // so check this otherwise it'll take the highlighting off all of them
        if (!$element.find('.js-link[data-position="' + lastClicked + '"]').parent().hasClass(activeLinkClass)) {
          lastClicked = $element.find('.' + activeLinkClass).first().find('.js-link').attr('data-position')
        }
        removeActiveStateFromAllButCurrent($activeLinks, lastClicked)
        setActiveStepClass()
      }

      function removeActiveStateFromAllButCurrent ($activeLinks, current) {
        $activeLinks.each(function () {
          if ($(this).find('.js-link').attr('data-position').toString() !== current.toString()) {
            $(this).removeClass(activeLinkClass)
            $(this).find('.visuallyhidden').remove()
          }
        })
      }

      function setActiveStepClass () {
        $element.find('.' + activeStepClass).removeClass(activeStepClass).removeAttr('data-show')
        $element.find('.' + activeLinkClass).closest('.app-step-nav__step').addClass(activeStepClass).attr('data-show', '')
      }

      function bindToggleShowHideAllButton (stepNavTracker) {
        $showOrHideAllButton = $element.find('.js-step-controls-button')
        $showOrHideAllButton.on('click', function () {
          var shouldshowAll

          if ($showOrHideAllButton.text() === actions.showAllText) {
            $showOrHideAllButton.text(actions.hideAllText)
            $element.find('.js-toggle-link').html(actions.hideText)
            shouldshowAll = true

            stepNavTracker.track('pageElementInteraction', 'stepNavAllShown', {
              label: actions.showAllText + ': ' + stepNavSize
            })
          } else {
            $showOrHideAllButton.text(actions.showAllText)
            $element.find('.js-toggle-link').html(actions.showText)
            shouldshowAll = false

            stepNavTracker.track('pageElementInteraction', 'stepNavAllHidden', {
              label: actions.hideAllText + ': ' + stepNavSize
            })
          }

          setAllStepsShownState(shouldshowAll)
          $showOrHideAllButton.attr('aria-expanded', shouldshowAll)
          setShowHideAllText()

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
    }

    function StepView ($stepElement) {
      var $titleLink = $stepElement.find('.js-step-title-button')
      var $stepContent = $stepElement.find('.js-panel')

      this.title = $stepElement.find('.js-step-title-text').text().trim()
      this.element = $stepElement

      this.show = show
      this.hide = hide
      this.toggle = toggle
      this.setIsShown = setIsShown
      this.isShown = isShown
      this.isHidden = isHidden
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
        $stepElement.find('.js-toggle-link').html(isShown ? actions.hideText : actions.showText)
      }

      function isShown () {
        return $stepElement.hasClass('step-is-shown')
      }

      function isHidden () {
        return !isShown()
      }

      function numberOfContentItems () {
        return $stepContent.find('.js-link').length
      }
    }

    function StepToggleClick (event, stepView, $steps, stepNavTracker, stepIsOptional) {
      this.track = trackClick
      var $target = $(event.target)

      function trackClick () {
        var trackingOptions = { label: trackingLabel(), dimension28: stepView.numberOfContentItems().toString() }
        stepNavTracker.track('pageElementInteraction', trackingAction(), trackingOptions)
      }

      function trackingLabel () {
        return $target.closest('.js-toggle-panel').attr('data-position') + ' - ' + stepView.title + ' - ' + locateClickElement() + ': ' + stepNavSize + isOptional()
      }

      // returns index of the clicked step in the overall number of steps
      function stepIndex () { // eslint-disable-line no-unused-vars
        return $steps.index(stepView.element) + 1
      }

      function trackingAction () {
        return (stepView.isHidden() ? 'stepNavHidden' : 'stepNavShown')
      }

      function locateClickElement () {
        if (clickedOnIcon()) {
          return iconType() + ' click'
        } else if (clickedOnHeading()) {
          return 'Heading click'
        } else {
          return 'Elsewhere click'
        }
      }

      function clickedOnIcon () {
        return $target.hasClass('js-toggle-link')
      }

      function clickedOnHeading () {
        return $target.hasClass('js-step-title-text')
      }

      function iconType () {
        return (stepView.isHidden() ? 'Minus' : 'Plus')
      }

      function isOptional () {
        return (stepIsOptional ? ' ; optional' : '')
      }
    }

    function componentLinkClick (event, stepNavTracker, linkPosition) {
      this.track = trackClick

      function trackClick () {
        var trackingOptions = { label: $(event.target).attr('href') + ' : ' + stepNavSize }
        var dimension28 = $(event.target).closest('.app-step-nav__list').attr('data-length')

        if (dimension28) {
          trackingOptions.dimension28 = dimension28
        }

        stepNavTracker.track('stepNavLinkClicked', linkPosition, trackingOptions)
      }
    }

    // A helper that sends a custom event request to Google Analytics if
    // the GOVUK module is setup
    function StepNavTracker (totalSteps, totalLinks, uniqueId) {
      this.track = function (category, action, options) {
        // noop
      }
    }
  }
})(window.GOVUK.Modules)
