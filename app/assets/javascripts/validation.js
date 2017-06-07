$(document).on('submit', 'form', function (e) {
  e.preventDefault()
  var reqFields = $('[data-required]')

  if (reqFields.length > 0) {
    e.preventDefault()
    for (var i = 0; i < reqFields.length; i++) {
      var $formGroup = $(reqFields[i])
      var type = findInputType($formGroup)
      console.log(type)
    }
  }
})

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
