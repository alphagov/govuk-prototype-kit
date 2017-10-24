# Success/Fail Url Middleware

If you need to "sandwich" your prototype around another prototype to form a user journey you 
can do this via the Success/Fail Url Middleware. Think `Prototype -> Two Step Verification Prototype -> Prototype`.

For Example: You have sent a user from your prototype, to perform a journey on another prototype. When sending them over you send them with a `success` and `failure` url. This means your user can be sent back to your prototype from the other prototype at specified points. This enables you to "sandwich" your prototype around another's. This is particularly useful for integrating with another teams agnostic prototype without having to include their code in your prototype. 

You can use the `successFailUrl` middleware to save a `successUrl` or `failUrl` to a cookie, these 
can be sent to your prototype via the query parameters `?successUrl=http://www.success-url.com&failUrl=http://www.fail-url.com`.
Typically you would call `req.getSuccessUrl()` to get the `successUrl` or `req.getFailUrl()` 
to get the `failUrl` in a prototype. These can then be provided to a view via variables or used to redirect users after a form submit in your routes.

An example of the success and fail urls can be seen here: [Success/Fail Url Example](http://localhost:3000/success-fail-url?successUrl=http://www.success-url.com&failUrl=http://www.fail-url.com)

## Use cases
- Redirect a user on success or failure of a service

### Success/Failure Url redirect example
This example would enable a form to send a user to either a success or fail url dependent on the logic in the route.
```javascript
router.post('/redirect', function (req, res) {
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
```

### Sending Success and Fail Url to view example
This example will provide your view with the variables `successUrl` and `failUrl`, you could then use these to populate the `href` attribute on `<a>` elements.

```javascript
router.post('/redirect', function (req, res) {
  var path = req.params[0]
  var successUrl = req.getSuccessUrl()
  var failUrl = req.getFailUrl()

  res.render(path, {
    successUrl: successUrl,
    failUrl: failUrl
  }, function (err, html) {
    if (err) {
      res.status(404).send(err)
    } else {
      res.end(html)
    }
  })
})
```
