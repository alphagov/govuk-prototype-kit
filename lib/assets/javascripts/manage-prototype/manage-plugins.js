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
    if (element) {
      element.hidden = false
    }
  }

  const hide = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.hidden = true
    }
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
      body: JSON.stringify({})
    })
      .then(response => {
        return response.json()
      })
  }

  const getRequest = (url) => {
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
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

  const pollStatus = (statusUrl) => {
    // Be aware that changing this path for monitoring the status of a plugin will affect the
    // kit update process as the browser request and server route would be out of sync.
    return getRequest(statusUrl)
      .then(data => {
        console.log(data)
        if (kitIsRestarting) {
          // kit has restarted as the request has returned with data
          kitIsRestarting = false
          if (data.status === 'processing') {
            return makeRequest(() => pollStatus(statusUrl))
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
            return makeRequest(() => pollStatus(statusUrl))
          }
        }
      })
      .catch(() => {
        return makeRequest(() => pollStatus(statusUrl))
      })
  }

  const getToken = () => {
    return fetch('/manage-prototype/csrf-token')
      .then(response => response.json())
      .then(({ token }) => token)
  }

  const performAction = (event) => {
    hide('dependency-heading')
    show('plugin-heading')

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
      .then((token) => postRequest(window.location.href, token))
      .then(data => {
        console.log('triggered', data)
        return makeRequest(() => pollStatus(data.statusUrl))
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
