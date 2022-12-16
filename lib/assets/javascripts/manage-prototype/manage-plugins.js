window.GOVUKPrototypeKit.documentReady(() => {
  const params = new URLSearchParams(window.location.search)
  const packageName = params.get('package')
  const mode = params.get('mode') || window.location.pathname.split('/').pop()
  let startTimestamp = ''
  let requestTimeoutId
  let timedOut = false
  const timeout = 30 * 1000
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

  const show = (id) => {
    const element = document.getElementById(id)
    element.hidden = false
  }

  const hide = (id) => {
    const element = document.getElementById(id)
    element.hidden = true
  }

  const log = (status) => {
    window.console.info(`GOV.UK Prototype Kit - ${status} ${mode} of ${packageName}`)
  }

  const showCompleteStatus = () => {
    clearTimeout(actionTimeoutId)
    log('Successful')
    hide('panel-processing')
    show('panel-complete')
    show('instructions-complete')
  }

  const showErrorStatus = () => {
    log('Failed')
    hide('panel-processing')
    show('panel-error')
  }

  const postRequest = (url) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'CSRF-Token': token
    },
    body: JSON.stringify({
      package: packageName
    })
  })

  const actionTimeoutId = setTimeout(() => {
    timedOut = true
  }, timeout)

  const pollStatus = () => {
    log('Processing')
    if (requestTimeoutId) {
      clearTimeout(requestTimeoutId)
    }
    if (timedOut) {
      showErrorStatus()
    } else {
      postRequest('/manage-prototype/plugins/status')
        .then(response => response.json())
        .then(data => {
          requestTimeoutId = setTimeout(() => {
            if (data.status === 'error') {
              clearTimeout(actionTimeoutId)
              showErrorStatus()
            } else if (data.startTimestamp === startTimestamp) {
              // poll status again if prototype hasn't restarted
              pollStatus()
            } else {
              showCompleteStatus()
            }
          }, 1000)
        })
        .catch(() => {
          requestTimeoutId = setTimeout(pollStatus, 1000)
        })
    }
  }

  const performAction = (event) => {
    log('Starting')

    if (event) {
      event.preventDefault()
      hide('plugin-action-confirmation')
    }

    show('panel-processing')

    postRequest(`/manage-prototype/plugins/${mode}`)
      .then(response => response.json())
      .then(data => {
        switch (data.status) {
          case 'completed': {
            // Command has already been run
            showCompleteStatus()
            break
          }
          case 'processing': {
            startTimestamp = data.startTimestamp
            pollStatus()
            break
          }
          default: {
            // Default to error
            showErrorStatus()
          }
        }
      })
      .catch(() => {
        showErrorStatus()
      })
  }

  hide('panel-manual-instructions')
  const actionButton = document.getElementById('plugin-action-button')

  if (actionButton) {
    actionButton.addEventListener('click', performAction)
  } else {
    performAction()
  }
})
