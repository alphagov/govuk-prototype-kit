const express = require('express')
const router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// Success/Failure Url redirect example
router.post('/success-fail-url', function (req, res) {
  var isSuccess = Boolean(req.body.success)
  var isFailure = Boolean(req.body.failure)
  var redirectUrl

  if (isSuccess) {
    redirectUrl = req.getSuccessUrl()
  } else if (isFailure) {
    redirectUrl = req.getFailUrl()
  }

  res.redirect(redirectUrl)
})

// add your routes here

module.exports = router
