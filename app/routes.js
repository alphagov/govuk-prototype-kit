module.exports = {
  bind : function (app, assetPath) {

    app.get('/', function (req, res) {
      res.render('index');
    });

    // add your routes here

  }
};
