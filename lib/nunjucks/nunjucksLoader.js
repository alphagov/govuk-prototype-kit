const nunjucks = require('nunjucks')

const NunjucksLoader = nunjucks.Loader.extend({
  init: function() {
    // setup a process which watches templates here
    // and call `this.emit('update', name)` when a template
    // is changed
  },

  getSource: function(name) {
    console.log('name', name)
    return '<h1>Hello world!</h1>'
  }
});

module.exports = { NunjucksLoader }
