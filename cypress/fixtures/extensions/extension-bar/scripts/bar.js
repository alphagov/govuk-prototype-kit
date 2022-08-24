
window.BAR = window.BAR || {}
window.BAR.Modules = window.BAR.Modules || {};

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
})(window.BAR.Modules)
