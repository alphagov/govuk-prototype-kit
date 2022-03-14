/* global $ */
$('body').on('submit', 'form', function (e) {
  // On form submit, add hidden inputs for checkboxes so the server knows if
  // they've been unchecked. This means we can automatically store and update
  // all form data on the server, including checkboxes that are checked, then
  // later unchecked

  const $checkboxes = $(this).find('input:checkbox')

  const $inputs = []
  const names = {}

  $checkboxes.each(function () {
    const $this = $(this)

    if (!names[$this.attr('name')]) {
      names[$this.attr('name')] = true
      const $input = $('<input type="hidden">')
      $input.attr('name', $this.attr('name'))
      $input.attr('value', '_unchecked')
      $inputs.push($input)
    }
  })

  $(this).prepend($inputs)
})
