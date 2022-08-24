
window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

((Modules) => {
  class ExtensionFoo {
    constructor (query) {
      console.log('Instantiate Extension Foo')
      const foo = document.querySelector(query)
      foo.classList.add('extension-foo')
      foo.addEventListener('click', () => this.onClick(foo))
    }

    onClick (foo) {
      foo.classList.add('extension-foo-clicked')
    }
  }

  Modules.ExtensionFoo = ExtensionFoo
})(window.GOVUK.Modules)
