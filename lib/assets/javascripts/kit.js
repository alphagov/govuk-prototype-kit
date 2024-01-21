window.GOVUKPrototypeKit = {
  majorVersion: 13,
  documentReady: (fn) => {
    if (document.readyState !== 'loading') {
      // IE9 support
      fn()
    } else {
      // Everything else
      document.addEventListener('DOMContentLoaded', fn)
    }
  },
  internal: {}
}

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('Now Prototype It - do not use for production')
}

window.GOVUKPrototypeKit.documentReady(function () {
  const sendPageLoadedRequest = function () {
    fetch('/manage-prototype/page-loaded').catch(() => {
      setTimeout(sendPageLoadedRequest, 500)
    })
  }
  sendPageLoadedRequest()
})
