var express     = require('express'),
    fs          = require("fs"),
    router      = express.Router();

/*
  Main route that maps the URL onto your /app/views/ folder
  and sees whether you have a .html template waiting there
  to use. If there's no template it checks whether the URL
  maps to a folder with a index.html in it. Otherwise it
  renders a 404 with an error message.
*/
router.get(/^\/([^.]+)$/, function (req, res) {

  var path = (req.params[0]);

  // remove the trailing slash because it seems nunjucks doesn't expect it.
  if (path.substr(-1) === '/') path = path.substr(0, path.length - 1);

  // try and render the path – it gets '.html' added
  // to it and searches in your "app/views/" folder.
  res.render(path, function(err, html)
  {
    // if it errors try seeing whether it's a folder
    // name and look for an index.html file inside it.
    if (err)
    {
      res.render(path + "/index", function(err2, html)
      {
        if (err2) {
          // no, nothing exists anywhere for this route. 404!
          res.status(404);
          res.render("404", {"path":path,"errors":[err,err2]}, function(err3, html)
          {
            if (err3) res.status(404).send('404 Not Found');
            else res.end(html);
          });
          // res.status(404).send('<b>'+path+' - not found</b><br />'+err+'<br />'+err2);
        } else {
          // it was a folder name.
          res.end(html);
        }
      });
    } else {
      // it was an html file.
      res.end(html);
    }
  });
});

router.post(/^\/([^.]+)$/, function (req, res) {
  var path = (req.params[0]);
  res.redirect('/'+path);
});

module.exports = router;
