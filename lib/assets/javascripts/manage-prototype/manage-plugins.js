;(() => {
  const params = new URLSearchParams(window.location.search)
  const packageName = params.get('package')
  const version = params.get('version')
  const mode = params.get('mode') || window.location.pathname.split('/').pop()

  const timeout = 30 * 1000

  let requestTimeoutId
  let timedOut = false
  let kitIsRestarting = false
  let actionTimeoutId

  const show = (id) => {
    const element = document.getElementById(id)
    element.hidden = false
  }

  const hide = (id) => {
    const element = document.getElementById(id)
    element.hidden = true
  }

  const showCompleteStatus = () => {
    if (actionTimeoutId) {
      clearTimeout(actionTimeoutId)
    }
    hide('panel-processing')
    show('panel-complete')
    show('instructions-complete')
  }

  const showErrorStatus = () => {
    if (actionTimeoutId) {
      clearTimeout(actionTimeoutId)
    }
    hide('panel-processing')
    show('panel-error')
  }

  const postRequest = (url, token) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token
      },
      body: JSON.stringify({
        package: packageName,
        version
      })
    })
      .then(response => {
        return response.json()
      })
  }

  const makeRequest = (fn) => {
    return new Promise((resolve) => {
      if (requestTimeoutId) {
        clearTimeout(requestTimeoutId)
      }
      if (timedOut) {
        showErrorStatus()
        resolve()
      } else {
        requestTimeoutId = setTimeout(() => fn().then(resolve), 1000)
      }
    })
  }

  const pollStatus = () => {
    // Be aware that changing this path for monitoring the status of a plugin will affect the
    // kit upgrade process as the browser request and server route would be out of sync.
    return postRequest(`/manage-prototype/plugins/${mode}/status`)
      .then(data => {
        if (kitIsRestarting) {
          // kit has restarted as the request has returned with data
          kitIsRestarting = false
          if (data.status === 'processing') {
            return makeRequest(performAction)
          }
        }
        switch (data.status) {
          case 'completed':
            return showCompleteStatus()
          case 'error': {
            return showErrorStatus()
          }
          default: {
            // poll status again if prototype hasn't restarted
            return makeRequest(pollStatus)
          }
        }
      })
      .catch(() => {
        // kit must be restarting as the request failed
        kitIsRestarting = true
        return makeRequest(pollStatus)
      })
  }

  const getToken = () => {
    return fetch('/manage-prototype/csrf-token')
      .then(response => response.json())
      .then(({ token }) => token)
  }

  const performAction = (event) => {
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

    return getToken()
      .then((token) => postRequest(`/manage-prototype/plugins/${mode}`, token))
      .then(data => {
        switch (data.status) {
          case 'completed':
            return showCompleteStatus()
          case 'processing':
            return makeRequest(pollStatus)
          default:
            return showErrorStatus()
        }
      })
      .catch(() => {
        // kit must be restarting as the request failed so try again
        return makeRequest(performAction)
      })
  }

  const init = () => {
    kitIsRestarting = false
    timedOut = false
    actionTimeoutId = null
    requestTimeoutId = null

    hide('panel-manual-instructions')
    const actionButton = document.getElementById('plugin-action-button')

    if (actionButton) {
      actionButton.addEventListener('click', performAction)
    } else {
      return performAction()
    }
  }

  window.GOVUKPrototypeKit.internal.managePlugins = {
    showCompleteStatus,
    showErrorStatus,
    pollStatus,
    performAction,
    init
  }
})()
