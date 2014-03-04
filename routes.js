module.exports = {
  bind : function (app, assetPath) {
    app.get('/', function (req, res) {

      res.render('index',
                {'assetPath' : assetPath});
      
    });

    app.get('/sample', function (req, res) {
      
      res.render('sample',
                {'assetPath' : assetPath});
    });

    app.get('/hmm', function (req, res) {
      
      res.render('hmm',
                {'assetPath' : assetPath});
    });
  }
};
