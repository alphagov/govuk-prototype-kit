var util = require('util')

module.exports = {
  clear: function(req, res) {
    console.log("Clearing all user values.")
    for (cookie in req.cookies) {
      if (req.cookies.hasOwnProperty(cookie)) {
      res.clearCookie(cookie);
      }
    }
  },

  form_to_cookie: function(presenters) {
    return function(req, res, next) {
      if (req.method=="POST") {
        console.log("Adding " + util.inspect(req.body) + " to the cookies.")
        for (key in req.body) {
          if (req.body.hasOwnProperty(key) && req.body[key]) {
            var raw_value = req.body[key]
            var value = presenters[key] ? presenters[key](raw_value) : raw_value
            res.cookie(key, value);
          }
        }
      }
      next();
    }
  }
};
