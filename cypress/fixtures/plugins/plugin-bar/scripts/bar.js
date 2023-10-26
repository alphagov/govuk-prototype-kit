window.BAR = window.BAR || {}
window.BAR.Modules = window.BAR.Modules || {};

((Modules) => {
  class PluginBar {
    constructor (query) {
      console.log('Instantiate Plugin Bar')
      const bar = document.querySelector(query)
      bar.classList.add('plugin-bar')
      bar.addEventListener('click', () => this.onClick(bar))
    }

    onClick (bar) {
      bar.classList.add('plugin-bar-clicked')
    }
  }

  Modules.PluginBar = PluginBar
})(window.BAR.Modules)
