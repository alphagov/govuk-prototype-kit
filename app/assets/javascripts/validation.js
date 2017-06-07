$(document).on('submit', 'form', function (e) {
  var reqFields = $('[data-required]')

  if (reqFields.length > 0) {
    e.preventDefault()
    var errorMessages = []

    for (var i = 0; i < reqFields.length; i++) {
      var $formGroup = $(reqFields[i])
      var type = findInputType($formGroup)
      var errorMessage = getErrorMessage($formGroup, type)
      var linkID = getLinkID($formGroup)

      errorMessages.push({linkID, message: errorMessage})

      addErrorClass($formGroup)
      appendLabelErrorMessage($formGroup, type, errorMessage)
      // add the error message to the individual field
    }
    // append the error summary
    // loop error messages into summary
  }
})

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
