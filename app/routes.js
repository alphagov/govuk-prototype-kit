var express = require('express')
var router = express.Router()

router.use(function (req, res, next) {
 // Store common vars in string

  res.locals.formData = ''
  res.locals.formQuery = '?'
  res.locals.data = {}

  for (var name in req.query) {
    var value = req.query[name]
    res.locals.formData += '<input type="hidden" name="' + name + '" value="' + value + '">\n'
    res.locals.formQuery += name + '=' + value + '&'
    res.locals.data[name] = value
  }

  next()
})

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

module.exports = router
