window.GOVUKPrototypeKit.documentReady(() => {
  const params = new URLSearchParams(window.location.search)
  const packageName = params.get('package')
  const mode = params.get('mode') || window.location.pathname.split('/').pop()
  const pluginsLink = `/manage-prototype/plugins?mode=${mode}&package=${packageName}`
  let startTimestamp = ''
  let requestTimeoutId
  let timedOut = false
  const timeout = 30*1000

  const showCompleteStatus = () => {
    const panelProcessing = document.getElementById('panel-processing')
    panelProcessing.classList.add("govuk-!-display-none")
    const panelComplete = document.getElementById('panel-complete')
    panelComplete.classList.remove("govuk-!-display-none")
    const instructionsComplete = document.getElementById('instructions-complete')
    instructionsComplete.classList.remove("govuk-!-display-none")
  }

  const showErrorStatus = () => {
    const panelProcessing = document.getElementById('panel-processing')
    panelProcessing.classList.add("govuk-!-display-none")
    const panelError = document.getElementById('panel-error')
    panelError.classList.remove("govuk-!-display-none")
  }

  const postRequest = (url) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      package: packageName
    })
  })

  const actionTimeoutId = setTimeout(() => {
    timedOut = true
  }, timeout)

  const pollStatus = (callback, timeout) => {
    if (requestTimeoutId) {
      clearTimeout(requestTimeoutId)
    }
    if (timedOut){
      showErrorStatus()
    } else {
      postRequest('/manage-prototype/plugins/status')
        .then(response => response.json())
        .then(data => {
          requestTimeoutId = setTimeout(() => {
            // poll status again if prototype hasn't restarted
            if (data.startTimestamp === startTimestamp) {
              pollStatus(callback, timeout - 1000)
            } else {
              clearTimeout(actionTimeoutId)
              callback()
            }
          }, 1000)
        })
        .catch(() => {
          requestTimeoutId = setTimeout(() => pollStatus(callback, timeout - 1000), 1000)
        })
    }
  }

  postRequest(`/manage-prototype/plugins/${mode}`)
    .then(response => response.json())
    .then(data => {
      startTimestamp = data.startTimestamp
      pollStatus(() => showCompleteStatus())
    })
})
