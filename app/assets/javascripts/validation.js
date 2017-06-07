$(document).on('submit', 'form', function (e) {
  var reqFields = $('[data-required]')
  e.preventDefault()

  if (reqFields.length > 0) {
    var invalidFields = validateAll(reqFields)
    console.log(invalidFields)
  }
  // if errors
  sortErrorMessages(reqFields)
})

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
  if ((type === 'text' || type === 'textarea') && $formGroup.find('input, textarea').val().length > 0) {
    return false
  }
  if ((type === 'radio' || type === 'checkbox') && $formGroup.find(':checked').length > 0) {
    return false
  }
  return true
}

function sortErrorMessages (reqFields) {
  var errorMessages = []

  for (var i = 0; i < reqFields.length; i++) {
    var $formGroup = $(reqFields[i])
    var type = findInputType($formGroup)
    var errorMessage = getErrorMessage($formGroup, type)
    var linkID = getLinkID($formGroup)

    errorMessages.push({ linkID, message: errorMessage })

    addErrorClass($formGroup)
    appendLabelErrorMessage($formGroup, type, errorMessage)
  }
  prependErrorSummary()
  addErrorLinksToSummary(errorMessages)
}

function addErrorLinksToSummary (errorMessages) {
  var $errorSummaryList = $('.error-summary-list:first')
  $errorSummaryList.html('')
  for (var i = 0; i < errorMessages.length; i++) {
    $errorSummaryList.append(
      `<li>
        <a href="#${errorMessages[i].linkID}">${errorMessages[i].message}</a>
      </li>`
    )
  }
}

function prependErrorSummary () {
  var notPrepended = $('.error-summary').length === 0
  if (notPrepended) {
    $('main').prepend(
      `<div class="error-summary" role="group" aria-labelledby="error-summary-heading-example-1" tabindex="-1">

        <h1 class="heading-medium error-summary-heading" id="error-summary-heading-example-1">
          There's been a problem
        </h1>

        <p>
          Check the following:
        </p>
        
        <ul class="error-summary-list">
          
        </ul>
      </div>`
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

  if ((type === 'radio' || type === 'checkbox') && notAppended) {
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
  return (type === 'text' || type === 'textarea') ? 'Cannot be blank' : 'Choose an option'
}

function addErrorClass ($formGroup) {
  return $formGroup.addClass('form-group-error')
}

function findInputType ($formGroup) {
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
