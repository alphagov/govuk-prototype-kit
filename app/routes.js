const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
router.get('/zalozenie-zivnosti/:pageUrl', function (req, res) {
  if (req.params.pageUrl == null) return res.render('zalozenie-zivnosti/index.html')
})

module.exports = router
