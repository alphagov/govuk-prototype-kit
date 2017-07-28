var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// Routes for tutorials

require(__dirname + '/views/tutorials/3-routes/routes')(router);
require(__dirname + '/views/tutorials/4-data/routes')(router);



// add your routes here

module.exports = router
