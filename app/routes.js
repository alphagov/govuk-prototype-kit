var express = require('express')
var router = express.Router()

var detailedGuideController = require('./controllers').detailedGuide
var htmlPublicationController = require('./controllers').htmlPublication
var manualController = require('./controllers').manual
// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here
router.get('/detailed-guide', detailedGuideController.show)
router.get('/html-publication', htmlPublicationController.show)
router.get('/manual', manualController.show)
router.get('/manual/chapter', manualController.showChapter)

module.exports = router
