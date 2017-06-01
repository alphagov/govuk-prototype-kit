var express = require('express')
var fs = require('fs')
var marked = require('marked')
var path = require('path')
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

// Pages in install folder are markdown
router.get('/install/:page', function (req, res) {
  // If the link already has .md on the end (for GitHub docs)
  // remove this when we render the page
  if (req.params.page.slice(-3).toLowerCase() === '.md') {
    req.params.page = req.params.page.slice(0, -3)
  }
  redirectMarkdown(req.params.page, res)
  var doc = fs.readFileSync(path.join(__dirname, '/documentation/install/', req.params.page + '.md'), 'utf8')
  var html = marked(doc)
  res.render('install_template', {'document': html})
})

// Examples - exampes post here
router.post('/tutorials-and-examples', function (req, res) {
  res.redirect('tutorials-and-examples')
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
    res.redirect('/docs/examples/under-18')
  } else {
    // if over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18')
  }
})

// routes for 'check eligibility, cost and time' pattern

// question in /docs/examples/check-eligibility-cost-time/over-18
router.get('/examples/check-eligibility-cost-time/passengers', function (req, res) {
  // get the answer from the query string (eg. ?over18="yes")
  var over18 = req.query.over18

  console.log(over18)

  if (over18 === 'no') {
    // if users is NOT 18 or over
    res.redirect('/docs/examples/check-eligibility-cost-time/result/not-eligible' + res.locals.formQuery)
  } else {
    // if users IS 18 or over
    res.render('examples/check-eligibility-cost-time/passengers/index.html')
  }
})

// question in /docs/examples/check-eligibility-cost-time/passengers
router.get('/examples/check-eligibility-cost-time/weight/empty', function (req, res) {
  console.log('passengers')

  // get the answer from the query string (eg. ?over18="yes")
  var passengers = req.query.passengers

  if (passengers === 'yes') {
    // if vehicles WILL be carrying passengers
    res.redirect('/docs/examples/check-eligibility-cost-time/result/not-eligible' + res.locals.formQuery)
  } else {
    // if vehicles will NOT be carrying passengers
    res.render('examples/check-eligibility-cost-time/weight/empty/index.html')
  }
})

// question in /docs/examples/check-eligibility-cost-time/weight/empty/index.html
// question in /docs/examples/check-eligibility-cost-time/weight/loaded/index.html
router.get('/examples/check-eligibility-cost-time/how-many-vehicles', function (req, res) {
  console.log('weight')

  // get the answer from the query string (eg. ?over18="yes")
  var weightEmpty = req.query.weight_empty
  var weightLoaded = req.query.weight_loaded

  if (weightEmpty === 'less than 1,525 kg' && weightLoaded === undefined) {
    // if vehicles are TOO LIGHT when empty for licence
    res.redirect('/docs/examples/check-eligibility-cost-time/weight/loaded' + res.locals.formQuery)
  } else if (weightEmpty === 'less than 1,525 kg' && weightLoaded === 'less than 3,5000 kg') {
    // if vehicles are TOO LIGHT when empty and loaded for licence
    res.redirect('/docs/examples/check-eligibility-cost-time/result/not-eligible' + res.locals.formQuery)
  } else {
    // if vehicles are HEAVY ENOUGH when empty or loaded for licence
    res.render('examples/check-eligibility-cost-time/how-many-vehicles/index.html')
  }
})

// question in /docs/examples/check-eligibility-cost-time/licence-type/just-your-goods/index.html
router.get('/examples/check-eligibility-cost-time/result/eligible', function (req, res) {
  console.log('just_your_goods')

  // get the answer from the query string (eg. ?over18="yes")
  var justYourGoods = req.query.just_your_goods
  var outsideUk = req.query.outside_uk

  if (justYourGoods === 'no' && outsideUk === undefined) {
    // user needs INTERNATIONAL licence
    res.redirect('/docs/examples/check-eligibility-cost-time/licence-type/outside-uk' + res.locals.formQuery)
  } else {
    // user needs STANDARD licence
    res.render('examples/check-eligibility-cost-time/result/eligible/index.html')
  }
})

// calculate amounts in /docs/examples/check-eligibility-cost-time/result/cost
router.get('/examples/check-eligibility-cost-time/result/cost', function (req, res) {
  console.log('application_cost')

  // get the answer from the query string (eg. ?over18="yes")
  var amount = req.query.amount

  if (amount === 'value') {
    // if user IS related to child
    res.redirect('/docs/examples/check-eligibility-cost-time/result/not-eligible' + res.locals.formQuery)
  } else {
    var applicationCost = 257 + 401 + 6650 + (req.query.how_many_vehicles - 1) * 3700

    applicationCost = applicationCost.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    var maintenanceCosts = 6650 + (req.query.how_many_vehicles - 1) * 3700

    maintenanceCosts = maintenanceCosts.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    // if user is NOT related to child
    res.render('examples/check-eligibility-cost-time/result/cost/index.html', {applicationCost: applicationCost, maintenanceCosts: maintenanceCosts})
  }
})

module.exports = router

// Strip off markdown extensions if present and redirect
var redirectMarkdown = function (requestedPage, res) {
  if (requestedPage.slice(-3).toLowerCase() === '.md') {
    res.redirect(requestedPage.slice(0, -3))
  }
  if (requestedPage.slice(-9).toLowerCase() === '.markdown') {
    res.redirect(requestedPage.slice(0, -9))
  }
}
