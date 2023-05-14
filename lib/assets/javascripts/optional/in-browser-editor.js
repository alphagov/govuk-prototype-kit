const url = location.pathname

const Types = {
  NUNJUCKS: { type: 'nunjucks' },
  JSON: { type: 'json' }
}

fetch(`/manage-prototype/editor/files-behind-url?url=${encodeURIComponent(url)}`)
  .then(x => x.json())
  .then(x => {
    if (x.success && x.files) {
      x.files.forEach(file => {
        showEditButton(file)
      })
    }
  })
  .catch(e => {
    console.error(e)
  })

function addChild ($parent, tag, classes = []) {
  const $newElem = document.createElement(tag)
  $parent.appendChild($newElem)
  classes.forEach(x => $newElem.classList.add(x))
  return $newElem
}

function httpPost (url, jsonBody) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonBody)
  })
}

function setupMenu () {
  if (setupMenu.result) {
    return setupMenu.result
  }
  const $bar = addChild(document.body, 'section', ['govuk-prototype-kit__editor__bar'])
  const $menu = addChild($bar, 'nav', ['govuk-prototype-kit__editor__bar--menu'])
  const $editor = addChild($bar, 'div', ['govuk-prototype-kit__editor__editor', 'govuk-prototype-kit__editor--hidden'])
  const $code = addChild($editor, 'textarea', ['govuk-prototype-kit__editor__editor__code'])
  const $saveButton = addChild($editor, 'button', ['govuk-prototype-kit__editor__editor__save-button'])
  const $cancelButton = addChild($editor, 'button', ['govuk-prototype-kit__editor__editor__cancel-button'])
  const $deleteButton = addChild($editor, 'button', ['govuk-prototype-kit__editor__editor__delete-button'])

  $saveButton.innerText = 'Save changes'
  $cancelButton.innerText = 'Cancel'
  $deleteButton.innerText = 'Delete file'

  function enterMenuMode () {
    $editor.classList.add('govuk-prototype-kit__editor--hidden')
    $menu.classList.remove('govuk-prototype-kit__editor--hidden')
  }

  function enterCodeMode () {
    $editor.classList.remove('govuk-prototype-kit__editor--hidden')
    $menu.classList.add('govuk-prototype-kit__editor--hidden')
  }

  setupMenu.result = { $menu, $editor, $code, $saveButton, $deleteButton, enterMenuMode, enterCodeMode }

  $saveButton.addEventListener('click', (e) => {
    e.preventDefault()

    setupMenu.result.disableEverything()

    const savePath = $saveButton.getAttribute('data-save-path')
    const url = `/manage-prototype/editor/file-contents?filePath=${encodeURIComponent(savePath)}`
    const jsonBody = {
      mode: 'write',
      contents: $code.value
    }
    httpPost(url, jsonBody)
      .then(() => {
        enterMenuMode()
      })
      .catch(() => {
        alert('Save failed.')

        setupMenu.result.enableEverything()
      })
  })

  $cancelButton.addEventListener('click', (e) => {
    e.preventDefault()

    enterMenuMode()
  })

  $deleteButton.addEventListener('click', (e) => {
    e.preventDefault()

    setupMenu.result.disableEverything()

    const deletePath = $deleteButton.getAttribute('data-save-path')
    if (confirm(`Are you sure you want to delete ${deletePath}?`)) {
      httpPost(`/manage-prototype/editor/file-contents?filePath=${encodeURIComponent(deletePath)}`, {
        mode: 'delete'
      })
        .then(() => {
          enterMenuMode()
          window.location.reload()
        })
        .catch(() => {
          alert('Delete failed.')

          setupMenu.result.enableEverything()
        })
    } else {
      setupMenu.result.enableEverything()
    }
  })

  setupMenu.result.enableEverything = () => {
    $code.disabled = false
    $saveButton.disabled = false
    $cancelButton.disabled = false
    $deleteButton.disabled = false
  }

  setupMenu.result.disableEverything = () => {
    $code.disabled = true
    $saveButton.disabled = true
    $cancelButton.disabled = true
    $deleteButton.disabled = true
  }

  return setupMenu.result
}

function showEditButton (fileConfig) {
  const { $menu, $code, $saveButton, $deleteButton, enableEverything, enterCodeMode } = setupMenu()

  const $editButton = addChild($menu, 'a', ['govuk-prototype-kit__editor__bar--menu--item'])

  $editButton.innerText = ['Edit', fileConfig.label || fileConfig.path].join(' ')
  $editButton.setAttribute('href', '#')
  $editButton.addEventListener('click', (e) => {
    e.preventDefault()

    fetch(`/manage-prototype/editor/file-contents?filePath=${encodeURIComponent(fileConfig.path)}`)
      .then(x => x.json())
      .then(x => {
        if (x.success) {
          enableEverything()
          const contents = x.contents
          enterCodeMode()
          $code.value = contents
          $saveButton.setAttribute('data-save-path', fileConfig.path)
          $deleteButton.setAttribute('data-save-path', fileConfig.path)
        } else {
          console.error(x)
        }
      })
      .catch(e => {
        alert('Failed to load file contents ' + fileConfig.path)
        console.error(e)
      })
  })
}
