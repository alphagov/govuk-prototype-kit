$(document).on('submit', 'form', function (e) {
  var reqFields = $('[data-required]')

  if (reqFields.length > 0) {
    var invalidFields = validateAll(reqFields)
    if (invalidFields.length > 0) {
      e.preventDefault()
      setTimeout(function () {
        clearAllErrors(reqFields)
        sortErrorMessages(invalidFields)
        $(window).scrollTop(0)
      }, 800)
    }
  }
})

function clearAllErrors (reqFields) {
  $(reqFields).each(function () {
    $(this).removeClass('form-group-error')
    $(this).find('.error-message').remove()
    $(this).find('.form-control-error').removeClass('form-control-error')
  })
}

function validateAll (reqFields) {
  var invalidFields = []
  for (var i = 0; i < reqFields.length; i++) {
    var $formGroup = $(reqFields[i])
    var invalid = validateSingleField($formGroup)
    if (invalid) {
      invalidFields.push($formGroup)
    }
  }
  return invalidFields
}

function validateSingleField ($formGroup) {
  var type = findInputType($formGroup)
  if ((type === 'text' || type === 'textarea' || type === 'date') && $formGroup.find('input, textarea').val().length > 0) {
    return false
  }
  if ((type === 'radio' || type === 'checkbox') && $formGroup.find(':checked').length > 0) {
    return false
  }
  return true
}

function sortErrorMessages (invalidFields) {
  var errorMessages = []

  for (var i = 0; i < invalidFields.length; i++) {
    var $formGroup = $(invalidFields[i])
    var type = findInputType($formGroup)
    var errorMessage = getErrorMessage($formGroup, type)
    var linkID = getLinkID($formGroup)
    var label = getLabelText($formGroup, type)

    errorMessages.push({ linkID, label, message: errorMessage })

    addErrorClass($formGroup, type)
    appendLabelErrorMessage($formGroup, type, errorMessage)
  }
  prependErrorSummary()
  addErrorLinksToSummary(errorMessages)
}

function getLabelText ($formGroup, type) {
  if (type === 'radio' || type === 'checkbox' || type === 'date') {
    return $formGroup.find('legend span:first').text()
  }
  return $formGroup.find('label').text()
}

function addErrorLinksToSummary (errorMessages) {
  var $errorSummaryList = $('.error-summary-list:first')
  $errorSummaryList.html('')
  for (var i = 0; i < errorMessages.length; i++) {
    var message = errorMessages[i].message.toLowerCase()
    $errorSummaryList.append(
      '<li>' +
        '<a href="#' + errorMessages[i].linkID + '">' +
          errorMessages[i].label + ' - ' + message +
        '</a>' +
      '</li>'
    )
  }
}

function prependErrorSummary () {
  var notPrepended = $('.error-summary').length === 0
  var heading = $('main').attr('data-errorHeading') || 'There\'s been a problem'
  var description = $('main').attr('data-errorDescription') || 'Check the following:'
  if (notPrepended) {
    $('main').prepend(
      '<div class="error-summary" role="group" aria-labelledby="error-summary-heading-example-1" tabindex="-1">' +
      ' <h1 class="heading-medium error-summary-heading" id="error-summary-heading-example-1">' +
          heading +
      ' </h1>' +
      ' <p>' +
          description +
      ' </p>' +
      ' <ul class="error-summary-list">' +
      '  </ul>' +
      '</div>'
    )
  }
}

function appendLabelErrorMessage ($formGroup, type, errorMessage) {
  var notAppended = $formGroup.find('.error-message').length === 0
  if ((type === 'text' || type === 'textarea') && notAppended) {
    return $formGroup.find('label').append(
      '<span class="error-message">' + errorMessage + '</span>'
    )
  }

  if ((type === 'radio' || type === 'checkbox' || type === 'date') && notAppended) {
    return $formGroup.find('legend').append(
      '<span class="error-message">' + errorMessage + '</span>'
    )
  }
}

function getLinkID ($formGroup) {
  return $formGroup.find('input:first').attr('id') || ''
}

function getErrorMessage ($formGroup, type) {
  var customError = $formGroup.attr('data-required')
  if (customError) {
    return customError
  }
  return (type === 'text' || type === 'textarea' || type === 'date') ? 'Cannot be blank' : 'Choose an option'
}

function addErrorClass ($formGroup, type) {
  if (type === 'text' || type === 'textarea' || type === 'date') {
    $formGroup.find('.form-control').addClass('form-control-error')
  }
  $formGroup.addClass('form-group-error')
}

function findInputType ($formGroup) {
  if ($formGroup.find('.form-date').length > 0) {
    return 'date'
  }
  if ($formGroup.find('input[type="radio"]').length > 0) {
    return 'radio'
  }
  if ($formGroup.find('input[type="checkbox"]').length > 0) {
    return 'checkbox'
  }
  if ($formGroup.find('textarea').length > 0) {
    return 'textarea'
  }
  return 'text'
}
