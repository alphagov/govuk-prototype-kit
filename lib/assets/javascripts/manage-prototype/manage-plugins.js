window.GOVUKPrototypeKit.documentReady(() => {
  const params = new URLSearchParams(window.location.search)
  const packageName = params.get('package')
  const version = params.get('version')
  const mode = params.get('mode') || window.location.pathname.split('/').pop()
  let requestTimeoutId
  let timedOut = false
  let kitIsRestarting = false
  let retries = 0
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
      package: packageName,
      version
    })
  })
    .then(response => response.json())

  const makeRequest = (fn) => {
    if (requestTimeoutId) {
      clearTimeout(requestTimeoutId)
    }
    if (timedOut) {
      showErrorStatus()
    } else {
      requestTimeoutId = setTimeout(fn, 1000)
    }
  }

  let actionTimeoutId

  const pollStatus = () => {
    log('Processing')
    // Be aware that changing this path for monitoring the status of a plugin will affect the
    // kit upgrade process as the browser request and server route would be out of sync.
    postRequest(`/manage-prototype/plugins/${mode}/status`)
      .then(data => {
        if (kitIsRestarting) {
          // kit has restarted as the request has returned with data
          kitIsRestarting = false
          if (data.status === 'processing') {
            makeRequest(performAction)
            return
          }
        }
        switch (data.status) {
          case 'completed': {
            showCompleteStatus()
            break
          }
          case 'error': {
            clearTimeout(actionTimeoutId)
            showErrorStatus()
            break
          }
          default: {
            // poll status again if prototype hasn't restarted
            makeRequest(pollStatus)
          }
        }
      })
      .catch(() => {
        // kit must be restarting as the request failed
        kitIsRestarting = true
        makeRequest(pollStatus)
      })
  }

  const performAction = (event) => {
    log('Starting')

    if (!actionTimeoutId) {
      actionTimeoutId = setTimeout(() => {
        timedOut = true
      }, timeout)
    }

    if (event && event.preventDefault) {
      event.preventDefault()
      hide('plugin-action-confirmation')
    }

    show('panel-processing')

    postRequest(`/manage-prototype/plugins/${mode}`)
      .then(data => {
        switch (data.status) {
          case 'completed': {
            // Command has already been run
            showCompleteStatus()
            break
          }
          case 'processing': {
            makeRequest(pollStatus)
            break
          }
          default: {
            if (retries > 1) {
              // Default to error
              showErrorStatus()
            } else {
              makeRequest(performAction)
              retries++
            }
          }
        }
      })
      .catch(() => {
        // kit must be restarting as the request failed so try again
        makeRequest(performAction)
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
