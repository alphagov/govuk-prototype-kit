var express = require('express')
const utils = require('../utils')
// var url = require('url')
const fs = require('fs')
var router = express.Router()

// CHECK

//if you need to pipe a value in

/*
router.get('/r', function(req, res){
    res.render(res.locals.folder + `/r`, { set })
})
*/

//if you need to do redirects it's easier to potentially just push to a router page
/*
router.all('/check-router', function(req, res, next){
if ((req.session.data['a'] == "X") && (req.session.data['type'] == "X") && (req.session.data['b'] == "X")){
  return res.redirect("x");
} else if (req.session.data['e']) {
  return res.redirect("y")
} else {
  return res.redirect("z")
}
})
*/





module.exports = router;
