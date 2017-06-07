$(document).on('submit', 'form', function (e) {
  e.preventDefault()
  var reqFields = $('[data-required]')

  if (reqFields.length > 0) {
    e.preventDefault()
  }
})
