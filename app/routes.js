var user_data = require('../lib/user_data.js');

module.exports = {
  bind : function (app) {

    app.get('/', function (req, res) {
      res.render('index');
    });

    app.get('/examples/template-data', function (req, res) {
      res.render('examples/template-data', { 'name' : 'Foo' });
    });

    app.get('/reset', function(req, res) {
      user_data.clear(req, res);
      res.redirect('/')
    });

    // add your routes here
  }
};
