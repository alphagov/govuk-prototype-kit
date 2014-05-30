module.exports = {
  bind : function (app, assetPath) {
    app.get('/', function (req, res) {

      res.render('index',
                {'assetPath' : assetPath});
      
    });


    /* Example pages */

    app.get('/examples/hello-world', function (req, res) {
      res.render('examples/hello-world', {'message' : 'Hello world'});
    });

    app.get('/examples/inheritance', function (req, res) {
      res.render('examples/inheritance/page-level', {'message' : 'Hello world'});
    });

    app.get('/examples/alpha', function (req, res) {
      res.render('examples/alpha/alpha', {'assetPath' : assetPath });    
    });


    app.get('/moop', function (req, res) {
      res.render('examples/elements', {'assetPath' : assetPath });    
    });

    app.get(/^\/(.+)/, function (req, res) {

      var path = (req.params[0]);

      console.log('looking up ' + path);

      res.render(path, {'assetPath' : assetPath }, function(err, html) {

        if (err) {

          res.send(404);

        } else {

          res.end(html);

        }

      });

    });

  }
};
