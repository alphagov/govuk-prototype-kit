const express = require('express')
const router = express.Router()

router.get('/cypress-test', (req, res) => {
  const heading = 'CYPRESS TEST PAGE'
  res.send(`
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

module.exports = router
