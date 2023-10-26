window.FOO = window.FOO || {}
window.FOO.Modules = window.FOO.Modules || {};

((Modules) => {
  class PluginFoo {
    constructor (query) {
      console.log('Instantiate Plugin Foo')
      const foo = document.querySelector(query)
      foo.classList.add('plugin-foo')
      foo.addEventListener('click', () => this.onClick(foo))
    }

    onClick (foo) {
      foo.classList.add('plugin-foo-clicked')
    }
  }

  Modules.PluginFoo = PluginFoo
})(window.FOO.Modules)
