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
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}
