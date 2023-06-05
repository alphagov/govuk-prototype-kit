(() => {
  const $monacoLoader = document.createElement('script')
  $monacoLoader.setAttribute('src', '/manage-prototype/editor/monaco-editor/min/vs/loader.js')
  document.body.appendChild($monacoLoader)

  $monacoLoader.addEventListener('load', () => {
    const url = location.pathname

    const Types = {
      NUNJUCKS: {type: 'nunjucks', language: 'twig'},
      JSON: {type: 'json', language: 'json'},
      JS: {type: 'javascript', language: 'javascript'},
      SCSS: {type: 'scss', language: 'scss'}
    }

    function getType(type) {
      const result = Types[type] || {}
      return result
    }

    let currentEditor

    require.config({paths: {vs: '/manage-prototype/editor/monaco-editor/min/vs'}})

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

    function addChild($parent, tag, classes = []) {
      const $newElem = document.createElement(tag)
      $parent.appendChild($newElem)
      classes.forEach(x => $newElem.classList.add(x))
      return $newElem
    }

    function httpPost(url, jsonBody) {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBody)
      })
    }

    function setupMenu() {
      if (setupMenu.result) {
        return setupMenu.result
      }
      const $bar = addChild(document.body, 'section', ['govuk-prototype-kit__editor__bar'])
      const $menu = addChild($bar, 'nav', ['govuk-prototype-kit__editor__bar--menu'])
      const $editor = addChild($bar, 'div', ['govuk-prototype-kit__editor__editor', 'govuk-prototype-kit__editor--hidden'])
      const $codeWrapper = addChild($editor, 'div', ['govuk-prototype-kit__editor__editor__codewrapper'])
      const $saveButton = addChild($editor, 'button', ['govuk-prototype-kit__editor__editor__save-button'])
      const $cancelButton = addChild($editor, 'button', ['govuk-prototype-kit__editor__editor__cancel-button'])

      const $deleteButton = addChild($editor, 'button', ['govuk-prototype-kit__editor__editor__delete-button'])
      $saveButton.innerText = 'Save changes'
      $cancelButton.innerText = 'Cancel'

      $deleteButton.innerText = 'Delete file'

      function enterMenuMode() {
        $editor.classList.add('govuk-prototype-kit__editor--hidden')
        $menu.classList.remove('govuk-prototype-kit__editor--hidden')
      }

      function enterCodeMode() {
        $editor.classList.remove('govuk-prototype-kit__editor--hidden')
        $menu.classList.add('govuk-prototype-kit__editor--hidden')
      }

      setupMenu.result = {$menu, $editor, $codeWrapper, $saveButton, $deleteButton, enterMenuMode, enterCodeMode}

      $saveButton.addEventListener('click', (e) => {
        e.preventDefault()

        save();
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
        $codeWrapper.disabled = false
        $saveButton.disabled = false
        $cancelButton.disabled = false
        $deleteButton.disabled = false
      }

      setupMenu.result.disableEverything = () => {
        $codeWrapper.disabled = true
        $saveButton.disabled = true
        $cancelButton.disabled = true
        $deleteButton.disabled = true
      }
      
      setupMenu.result.save = () => {
        setupMenu.result.disableEverything()

        const savePath = $saveButton.getAttribute('data-save-path')
        const url = `/manage-prototype/editor/file-contents?filePath=${encodeURIComponent(savePath)}`
        const jsonBody = {
          mode: 'write',
          contents: currentEditor.getValue()
        }
        httpPost(url, jsonBody)
          .then(() => {
            enterMenuMode()
          })
          .catch(() => {
            alert('Save failed.')

            setupMenu.result.enableEverything()
          })
      }

      return setupMenu.result
    }

    function showEditButton(fileConfig) {
      const {$menu, $codeWrapper, $saveButton, $deleteButton, enableEverything, enterCodeMode, save} = setupMenu()

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

              require(['vs/editor/editor.main'], function () {
                ;[...$codeWrapper.children].forEach($child => $codeWrapper.removeChild($child))
                const $code = addChild($codeWrapper, 'div', ['govuk-prototype-kit__editor__editor__code'])
                $code.addEventListener('keydown', (e) => {
                  if (e.metaKey && e.keyCode === 83) {
                    e.preventDefault()
                    save()
                  }
                })
                currentEditor = monaco.editor.create($code, {
                  value: contents,
                  language: getType(fileConfig.type).language
                })
              })
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

  })
})()
