// Core dependencies
const fs = require('fs')
const path = require('path')

// NPM dependencies
const express = require('express')
const router = express.Router()

// Local dependencies
const utils = require('../lib/utils')

// Page routes

// Docs index
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/install', function (req, res) {
  res.render('install')
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
  const renderOptions = utils.getRenderOptions(doc)
  res.render('install_template', renderOptions)
})

// When in 'promo mode', redirect to download the current release zip from
// GitHub, based on the version number from package.json
//
// Otherwise, redirect to the latest release page on GitHub, to avoid just
// linking to the same version being run by someone referring to the copy of the
// docs running in their kit
router.get('/download', function (req, res) {
  if (req.app.locals.promoMode === 'true') {
    const version = require('../package.json').version

    res.redirect(
      `https://github.com/alphagov/govuk-prototype-kit/releases/v${version}/download/govuk-prototype-kit-${version}.zip`
    )
  } else {
    res.redirect(
      'https://github.com/alphagov/govuk-prototype-kit/releases/latest'
    )
  }
})

// Examples - examples post here
router.post('/tutorials-and-examples', function (req, res) {
  res.redirect('tutorials-and-examples')
})

// Example routes

// Passing data into a page
router.get('/examples/template-data', function (req, res) {
  res.render('examples/template-data', { name: 'Foo' })
})

// Redirects

router.get('/examples/branching', function (req, res) {
  res.redirect('/docs/make-first-prototype/branching')
})

router.get('/making-pages', function (req, res) {
  res.redirect('/docs/make-first-prototype/create-pages')
})

router.get('/make-first-prototype/add-questions', function (req, res) {
  res.redirect('/docs/make-first-prototype/use-components')
})

router.get('/templates/check-your-answers', function (req, res) {
  res.redirect('/docs/templates/check-answers')
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
