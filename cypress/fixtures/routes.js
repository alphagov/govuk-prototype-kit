const router = require('govuk-prototype-kit').requests.setupRouter()

router.get('/cypress-test', (req, res) => {
  const heading = 'CYPRESS TEST PAGE'
  res.send(`<!DOCTYPE html>
    <html lang="en">
        <head>
            <title>${heading}</title>
        </head>
        <body>
            <h1>${heading}</h1>
        </body>
    </html>
`)
})

router.get('/error', (req, res, next) => {
  next(new Error('test error'))
})

router.get('/test-page', (req, res, next) => {
  res.render('test-page.html')
})
