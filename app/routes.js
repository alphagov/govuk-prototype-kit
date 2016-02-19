var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  
  res.render('index');

});




// add your routes here

module.exports = router;
