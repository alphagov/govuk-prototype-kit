var express = require('express')
var router = express.Router()
var scraper = require('./scraper')

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/scraper', function (req, res) {
  var content = new scraper(req, res);
  content.getAndRenderContent({
    uri: req.query.uri, // eg. https://www.digitalmarketplace.service.gov.uk/g-cloud/search?lot=cloud-software
    findQuery: req.query.findQuery // query selector ie. ".classname"
  });
})

// add your routes here

module.exports = router
