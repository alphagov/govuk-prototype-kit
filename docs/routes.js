var express = require('express'),
    request = require('request'),
    router = express.Router();

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/install', function (req, res) {
  var url = "";
  var options = {
    uri: 'https://api.github.com/repos/alphagov/govuk_prototype_kit/releases/latest',
    headers: {'user-agent': 'node.js'}
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body); // Show the HTML for the Google homepage. 
      var data = JSON.parse(body);
      url = data.zipball_url;
      console.log("Release url is", url);
      res.render('docs/install', { 'releaseURL' : url });
    } else {
      url = "https://github.com/alphagov/govuk_prototype_kit/releases/latest";
      console.log("Error getting release URL: " + error);
      res.render('docs/install', { 'releaseURL' : url });
    }

  });

});

// add your here

module.exports = router;