var express = require('express'),
    fs      = require('fs'),
    marked  = require('marked'),
    path    = require('path'),
    request = require('request'),
    router = express.Router(),
    utils = require(__dirname + '/../lib/utils.js');

router.get('/', function (req, res) {
  res.render('index');
});

router.post('/examples', function (req, res) {
  res.redirect('examples');
});

router.get('/install', function (req, res) {
  url = utils.getLatestRelease();
  res.render('install', { 'releaseURL' : url });
});

// Example routes - feel free to delete these

// Passing data into a page

router.get('/examples/template-data', function (req, res) {
  console.log('rendering template data');

  res.render('examples/template-data', { 'name' : 'Foo' });

});

// Branching

router.get('/examples/over-18', function (req, res) {

  // get the answer from the query string (eg. ?over18=false)
  var over18 = req.query.over18;

  if (over18 == "false"){

    // redirect to the relevant page
    res.redirect("examples/under-18");

  } else {

    // if over18 is any other value (or is missing) render the page requested
    res.render('examples/over-18');

  }

});

// Redirect documentation directory (just in case)
router.get('/documentation/', function (req, res) {
  res.redirect('documentation-and-examples');
});

// Pages in documentation folder are markdown
router.get('/documentation/:page', function (req, res) {
  redirectMarkdown(req.params.page, res);
  var doc = fs.readFileSync(path.join(__dirname + '/documentation/' + req.params.page + ".md"), "utf8");
  var html = marked(doc);
  res.render("documentation_template", {"document": html});
});

// Pages in install folder are markdown
router.get('/install/:page', function (req, res) {
  redirectMarkdown(req.params.page, res);
  var doc = fs.readFileSync(path.join(__dirname + '/documentation/install/' + req.params.page + ".md"), "utf8");
  var html = marked(doc);
  res.render("install_template", {"document": html});
});

// Strip off markdown extensions if present and redirect
var redirectMarkdown = function (requestedPage, res){
  if (requestedPage.slice(-3).toLowerCase() == ".md"){
    res.redirect(requestedPage.slice(0, -3));
  }
  if (requestedPage.slice(-9).toLowerCase() == ".markdown"){
    res.redirect(requestedPage.slice(0, -9));
  }
};


// add routes here

module.exports = router;