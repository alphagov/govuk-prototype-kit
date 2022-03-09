/* eslint-env jquery */

// Select all checkbox change
$('.jsCheckboxAll').change(function () {
  // Change all ".jsCheckbox" checked status
  $('.jsCheckbox').prop('checked', $(this).prop('checked'))

  // Toggle checked class on other checkboxes
  if ($(this).prop('checked')) {
    $('.jsCheckbox').parents('tr').addClass('checked')
  } else {
    $('.jsCheckbox').parents('tr').removeClass('checked')
  }
})

// ".jsCheckbox" change
$('.jsCheckbox').change(function () {
  $(this).parents('tr').toggleClass('checked')

  // uncheck "select all", if one of the listed checkbox item is unchecked
  if ($(this).prop('checked') === false) {
    // change "select all" checked status to false
    $('.jsCheckboxAll').prop('checked', false)
  }

  // check "select all" if all checkbox items are checked
  if ($('.jsCheckbox:checked').length === $('.jsCheckbox').length) {
    $('.jsCheckboxAll').prop('checked', true)
  }
})

// Select entire table row
$('.table-clickable tbody tr').click(function (e) {
  if (e.target.type === 'checkbox') {
    // stop the bubbling to prevent firing the rows click event
    e.stopPropagation()
  } else {
    // Click the
    if ($(this).hasClass('checked')) {
      $(this).find('input').click()
      $(this).removeClass('checked')
    } else {
      $(this).find('input').click()
      $(this).addClass('checked')
    }
  }
})
