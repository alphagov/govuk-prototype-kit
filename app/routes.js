var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.redirect('/docs')
})

// add your routes here

module.exports = router
