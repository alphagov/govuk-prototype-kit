var express = require('express')
var router = express.Router()
var scrape = require('./scraper')

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/scraper', function (req, res) {
  var content = new scrape(req, res);
  content.getAndRenderContent({
    uri: req.query.uri,
    findQuery: req.query.findQuery
  });
})

// add your routes here

module.exports = router
