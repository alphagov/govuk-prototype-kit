var express = require('express')
var router = express.Router()
var utils = require('../lib/utils.js')

// Page routes

// Docs index
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/install', function (req, res) {
  var url = utils.getLatestRelease()
  res.render('install', { 'releaseURL': url })
})

// Examples - exampes post here
router.post('/examples', function (req, res) {
  res.redirect('examples')
})

// Example routes

// Passing data into a page

router.get('/examples/template-data', function (req, res) {
  res.render('examples/template-data', { 'name': 'Foo' })
})

// Branching

router.get('/examples/over-18', function (req, res) {
  // get the answer from the query string (eg. ?over18=false)
  var over18 = req.query.over18

  if (over18 === 'false') {
    // redirect to the relevant page
    res.redirect('/examples/under-18')
  } else {
    // if over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18')
  }
})

module.exports = router
