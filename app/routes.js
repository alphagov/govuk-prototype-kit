var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {

  res.render('index');

});


// Example routes - feel free to delete these

// Passing data into a page

router.get('/examples/template-data', function (req, res) {

  res.render('examples/template-data', { 'name' : 'Foo' });

});

// Branching
router.get('/examples/hoursperweek', function (req, res) {

  // get the answer from the query string (eg.?hours=20 )
  var hours = req.query.hours;

  if (hours >= 35) {

    // redirect to the relevant page
    res.redirect("/examples/branch/full-time");

  } else {

    // redirect to the relevant page
    res.redirect('/examples/branch/part-time');

  }

});

// add your routes here

module.exports = router;
