
window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

((Modules) => {
  class ExtensionBar {
    constructor (query) {
      console.log('Instantiate Extension Bar')
      const bar = document.querySelector(query)
      bar.classList.add('extension-bar')
      bar.addEventListener('click', () => this.onClick(bar))
    }

    onClick (bar) {
      bar.classList.add('extension-bar-clicked')
    }
  }

  Modules.ExtensionBar = ExtensionBar
})(window.GOVUK.Modules)
