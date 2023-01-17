const http = require('http')

const responseStart = `<!DOCTYPE html>
<html>
<head>
<title>
  An error occurred - GOV.UK Prototype Kit
</title>
<style>
body {
  max-width: 900px;
  margin: auto;
  font-family: sans-serif;
  font-size: 16px;
}
@media screen and (max-width: 992px) {
  body {
    width: 90%;
  }
}
</style>
<body>`
const responseEnd = `
</body>
</html>`

const self = module.exports = {
  runDevServer: () => {
    try {
      require('./dev-server').runDevServer()
      // self.spinUpErrorServer()
    } catch (e) {
      console.log('I caught it, I caught it')
      self.spinUpErrorServer(e)
    }
  },
  spinUpErrorServer: (error) => {
    const requestListener = function (req, res) {
      const responseBodyLines = []
      
      res.setHeader("Content-Type", "text/html")
      res.writeHead(500)
      if (error) {
        responseBodyLines.push(`<h1>There was an error, the details are below</h1>`)
        responseBodyLines.push(`<p>${error.message}</p>`)
        responseBodyLines.push(`<p>${error.stack.replace('\n', '<br/>')}</p>`)
      } else {
        responseBodyLines.push(`<h1>We don't actually know what went wrong</h1>`)
        responseBodyLines.push(`<p>It's worth undoing the last thing you did.</p>`)
        responseBodyLines.push(`<p>For support please contact the prototype kit team.</p>`)
      }
      res.end(`${responseStart}${responseBodyLines.join('\n')}${responseEnd}`)
    }
    const port = 3000
    const server = http.createServer(requestListener)
    server.listen(port, 'localhost', () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  }
}
