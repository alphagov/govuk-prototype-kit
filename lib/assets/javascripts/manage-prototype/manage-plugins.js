window.GOVUKPrototypeKit.documentReady(() => {
  const params = new URLSearchParams(window.location.search)
  const packageName = params.get('package')
  const mode = params.get('mode') || window.location.pathname.split('/').pop()
  const pluginsLink = `/manage-prototype/plugins?mode=${mode}&package=${packageName}`
  let startTimestamp = ''
  let requestTimeoutId

  const status = {
    install: 'installed',
    uninstall: 'uninstalled',
    upgrade: 'upgraded'
  }

  const displayPluginStatus = (msg) => {
    const pluginAction = document.querySelector('.js-plugin-action')
    pluginAction.innerHTML = msg
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
    if (requestTimeoutId) {
      clearTimeout(requestTimeoutId)
    }
    displayPluginStatus('Failed to complete process, please contact support')
  }, 30000)

  const pollStatus = (callback, timeout) => {
    if (requestTimeoutId) {
      clearTimeout(requestTimeoutId)
    }
    postRequest('/manage-prototype/plugins/status')
      .then(response => response.json())
      .then(data => {
        requestTimeoutId = setTimeout(() => {
          // poll status again if prototype hasn't restarted
          if (data.startTimestamp === startTimestamp) {
            pollStatus(callback, timeout - 1000)
          } else {
            if (actionTimeoutId) {
              clearTimeout(actionTimeoutId)
              callback()
            }
          }
        }, 1000)
      })
      .catch(() => {
        requestTimeoutId = setTimeout(() => pollStatus(callback, timeout - 1000), 1000)
      })
  }

  postRequest(`/manage-prototype/plugins/${mode}`)
    .then(response => response.json())
    .then(data => {
      startTimestamp = data.startTimestamp
      pollStatus(() => displayPluginStatus(`Your plugin has been ${status[mode]} <br /> <a href="${pluginsLink}">Return to Plugins</a>`))
    })
})
