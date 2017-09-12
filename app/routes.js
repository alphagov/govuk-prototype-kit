var express = require('express')
var router = express.Router()
var scrape = require('./scrape')

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/scraper', function (req, res) {
  var content = new scrape(req, res);

  content.getContent({});
  res.render('index');
})

// add your routes here

module.exports = router
