var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/link-looks-like-button', function (req, res) {
  res.render('link-looks-like-button', { 'name' : 'Foo' });
});


router.get('/examples/template-data', function (req, res) {
  res.render('examples/template-data', { 'name' : 'Foo' });
});

// add your routes here

module.exports = router;