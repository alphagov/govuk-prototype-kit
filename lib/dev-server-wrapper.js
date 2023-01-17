const http = require('http')
const {
  formatForHtml,
  formatForHtmlWithLineNumbers,
  getErrorStyles,
  prepareNiceError
} = require('./error-handling-utils')

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

const errorStore = () => {
  const errorsStored = []
  return {
    store: (err) => {
      console.log('error stored', err.substring(0, 30) + '...')
      errorsStored.push(err)
    },
    retrieveLastError: () => {
      console.log('attempting to retrived', errorsStored.length)
      return errorsStored[errorsStored.length - 1]
    }
  }
}

function giveUp(responseBodyLines) {
  responseBodyLines.push(`<h1>We don't actually know what went wrong</h1>`)
  responseBodyLines.push(`<p>It's worth undoing the last thing you did.</p>`)
  responseBodyLines.push(`<p>For support please contact the prototype kit team.</p>`)
}

const self = module.exports = {
  errorStore: errorStore(),
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
      const lineNumbersToHighlight = []

      res.setHeader("Content-Type", "text/html")
      res.writeHead(500)
      const lastError = self.errorStore.retrieveLastError()

      if (error) {
        responseBodyLines.push(`<h1>There was an error, the details are below</h1>`)
        responseBodyLines.push(`<p>${formatForHtml(error.message)}</p>`)
        responseBodyLines.push(`<p>${formatForHtml(error.stack)}`)
      } else if (lastError) {
        const matcher = /^(\/[^:]+):(\d+)/
        const matches = matcher.exec(lastError)
        if (matches) {
          console.log('filename', matches[1])
          console.log('line', matches[2])
          console.log('error message', lastError.split('\n')[4])
          console.log('stack', lastError.split('\n').filter(x => x.trim().startsWith('at ')))
          console.log()
          console.log(lastError)
          // prepareNiceError()
          responseBodyLines.push('<h1>There was an error, the details are below (case 2)</h1>')
          responseBodyLines.push(`<code>${formatForHtml(lastError)}</code>`)
        } else {
          console.log('no match')
          giveUp(responseBodyLines)
        }
      } else {
        giveUp(responseBodyLines)
      }
      responseBodyLines.push(getErrorStyles(lineNumbersToHighlight))
      res.end(`${responseStart}${responseBodyLines.join('\n')}${responseEnd}`)
    }
    const port = 3000
    const server = http.createServer(requestListener)
    server.listen(port, 'localhost', () => {
      console.log(`Server is running on http://localhost:${port}`)
    })
  }
}
