// Core dependencies
const fs = require('fs')
const path = require('path')

// NPM dependencies
const express = require('express')
const marked = require('marked')
const router = express.Router()

// Local dependencies
const utils = require('../lib/utils.js')

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

// Cookies and Privacy policy are markdown
router.get('/cookies', function (req, res) {
  // render the nunjucks macros first
  req.app.render('cookies.md', function(error, html){
    // render the markdown
    html = marked(html)
    // add page layout
    res.render('markdown-docs-layout', {'document': html})
  })
})
router.get('/privacy-policy', function (req, res) {
  // render the nunjucks macros first
  req.app.render('privacy-policy.md', function(error, html){
    // render the markdown
    html = marked(html)
    // add page layout
    res.render('markdown-docs-layout', {'document': html})
  })
})

// Examples - examples post here
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
  // Get the answer from the query string (eg. ?over18=false)
  var over18 = req.query.over18

  if (over18 === 'false') {
    // Redirect to the relevant page
    res.redirect('/docs/examples/under-18')
  } else {
    // If over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18')
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
