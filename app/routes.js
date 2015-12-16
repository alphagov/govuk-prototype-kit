var express = require('express');
var router = express.Router();
var formRoutes = require(__dirname + '/routes/form');

formRoutes(router);

router.get('/', function (req, res) {
  res.render('index');
});


// Example route: Passing data into a page
router.get('/examples/template-data', function (req, res) {
  res.render('examples/template-data', { 'name' : 'Foo' });
});

// add your routes here

module.exports = router;