
window.BAZ = window.BAZ || {}
window.BAZ.Modules = window.BAZ.Modules || {};

((Modules) => {
  class ExtensionBaz {
    constructor (query) {
      console.log('Instantiate Extension Baz')
      const baz = document.querySelector(query)
      baz.classList.add('extension-baz')
      baz.addEventListener('click', () => this.onClick(baz))
    }

    onClick (baz) {
      baz.classList.add('extension-baz-clicked')
    }
  }

  Modules.ExtensionBaz = ExtensionBaz
})(window.BAZ.Modules)
