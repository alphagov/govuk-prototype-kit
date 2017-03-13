var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// Make pages with radio buttons named 'radio-group' route to their 'value' property

router.get('*', function (req, res) {

  //get the answer from the query string (eg. ?over18=false)
  var radioGroup = req.query['radio-group'];

  if (radioGroup) {

    res.redirect(radioGroup);

  } else {

    // if radio-group is any other value (or is missing) render the page requested
    var str = req.path;
    res.render( str.substring(1) );

  }
});

// add your routes here

module.exports = router
