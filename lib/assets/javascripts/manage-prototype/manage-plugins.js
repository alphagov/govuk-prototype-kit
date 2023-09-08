;(() => {
  const timeout = 30 * 1000

  let requestTimeoutId
  let timedOut = false
  let actionTimeoutId
  let localStorageKey

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

  const storeInLocalStorage = (status) => {
    window.localStorage.setItem(localStorageKey, JSON.stringify(status))
  }

  const cleanupLocalStorage = () => {
    const maxAgeInDays = 30
    const maxAgeEopchTime = new Date().getTime() - 1000 * 60 * 24 * maxAgeInDays
    const allKeys = Object.keys(window.localStorage)
    const expiredKeys = allKeys.filter(x => Number(x.split('#')[1]) < maxAgeEopchTime)
    expiredKeys.forEach(key => window.localStorage.removeItem(key))
  }

  const showCompleteStatus = () => {
    if (actionTimeoutId) {
      clearTimeout(actionTimeoutId)
    }
    hide('panel-processing')
    show('panel-complete')
    show('instructions-complete')
    cleanupLocalStorage()
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
        if (data.status) {
          storeInLocalStorage({ status: data.status, statusUrl })
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
      hide('plugin-action-confirmation-multiple')
    }

    show('panel-processing')

    return getToken()
      .then((token) => postRequest(window.location.href, token))
      .then(data => {
        storeInLocalStorage({ statusUrl: data.statusUrl })
        return makeRequest(() => pollStatus(data.statusUrl))
      })
      .catch(() => {
        // kit must be restarting as the request failed so try again
        return makeRequest(performAction)
      })
  }

  const loadPreviousStatus = (previousRunObj) => {
    console.log('previousState', previousRunObj)
    switch (previousRunObj.status) {
      case 'completed':
        return showCompleteStatus()
      case 'error': {
        return showErrorStatus()
      }
      default: {
        // poll status again if prototype hasn't restarted
        return makeRequest(() => pollStatus(previousRunObj.statusUrl))
      }
    }
  }

  const init = (config) => {
    timedOut = false
    actionTimeoutId = null
    requestTimeoutId = null
    if (window.location.hash) {
      localStorageKey = ['manage-plugins', window.location.pathname, window.location.hash].join('__')
    }

    hide('panel-manual-instructions')
    const actionButton = document.getElementById('plugin-action-button')
    const previousRun = localStorageKey && window.localStorage.getItem(localStorageKey)

    if (previousRun) {
      console.log('previous state exists')
      return loadPreviousStatus(JSON.parse(previousRun))
    } else if (actionButton) {
      actionButton.addEventListener('click', performAction)
    } else {
      // return console.log('would be auto-running')
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
