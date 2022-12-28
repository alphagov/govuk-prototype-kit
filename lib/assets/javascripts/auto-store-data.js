document.addEventListener('submit', (event) => {
  // On form submit, add hidden inputs for checkboxes so the server knows if
  // they've been unchecked. This means we can automatically store and update
  // all form data on the server, including checkboxes that are checked, then
  // later unchecked

  const $checkboxes = event.target.querySelectorAll('input[type=checkbox]')

  const $inputs = []
  const names = {}

  $checkboxes.forEach(($checkbox) => {
    const name = $checkbox.getAttribute('name')

    if (!names[name]) {
      names[name] = true
      const $input = document.createElement('input')
      $input.setAttribute('type', 'hidden')
      $input.setAttribute('name', name)
      $input.setAttribute('value', '_unchecked')
      $inputs.push($input)
    }
  })

  for (const $input of $inputs) {
    event.target.appendChild($input)
  }
})
