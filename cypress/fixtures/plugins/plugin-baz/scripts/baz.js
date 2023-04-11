window.BAZ = window.BAZ || {};
window.BAZ.Modules = window.BAZ.Modules || {};
((Modules) => {
    class PluginBaz {
        constructor(query) {
            console.log('Instantiate Plugin Baz');
            const baz = document.querySelector(query);
            baz.classList.add('plugin-baz');
            baz.addEventListener('click', () => this.onClick(baz));
        }
        onClick(baz) {
            baz.classList.add('plugin-baz-clicked');
        }
    }
    Modules.PluginBaz = PluginBaz;
})(window.BAZ.Modules);
