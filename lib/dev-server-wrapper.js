const http = require('http')
const {
  formatForHtml,
  getErrorStyles,
  prepareNiceError,
  isNodeModulesMissing
} = require('./error-handling-utils')

let lastStarted
let currentServer = {close: () => {}}

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
<script>
var consecutiveFailures = 0
function reload() {
    window.location = window.location.href
}
function poll() {
    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
               if (xmlhttp.responseText !== lastStarted) {
                   reload()
               }
           } else {
               consecutiveFailures++
               if (consecutiveFailures > 2) {
                   reload()
               }
           }
           setTimeout(poll, 500)
        }
    };

    xmlhttp.open("GET", "/last-updated", true)
    xmlhttp.send()
}
if (lastStarted) {
  poll()
}
</script>
</body>
</html>`

const errorStore = () => {
  const errorsStored = []
  return {
    store: (err) => {
      errorsStored.push(err)
    },
    retrieveLastError: () => {
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
      self.spinUpErrorServer(e)
    }
  },
  spinUpErrorServer: (error) => {
    const requestListener = async function (req, res) {
      let url = req.url.split('?')[0];
      if (url === '/favicon.ico') {
        res.end('')
        return
      }
      if (url === '/last-updated') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.end('' + lastStarted)
        return
      } else {
      }
      const responseBodyLines = [`<script>var lastStarted="${lastStarted}"</script>`]
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
          const [, filePath, line] = matches
          const errorMessage = lastError.split('\n')[4]
          const formattedStack = formatForHtml(lastError.split('\n').filter(x => x.trim().startsWith('at ')).join('\n'))
          const {
            pathFromAppRoot,
            codeArea,
            formattedFileContents,
            highlightLines
          } = await prepareNiceError(filePath, errorMessage, line)
          highlightLines.forEach(x => lineNumbersToHighlight.push(x))
          responseBodyLines.push('<h1>There was an error, the details are below</h1>')
          responseBodyLines.push(`
<p>${formatForHtml(codeArea)}</p>
    
<hr/>

<p>The error was in the file:</p>
<p>${formatForHtml(pathFromAppRoot)}</p>
    
<hr/>

<p>The error message was:</p>
<p>${formatForHtml(errorMessage)}</p>

<hr/>

<p>This is where the error occurred:</p>
<p>${formattedFileContents}</p>

<hr/>

<p>This is the "stack" - the different functions that lead to this error:</p>
<code>${formattedStack}</code>

<hr/>
          `)
        } else if (await isNodeModulesMissing()) {
          responseBodyLines.push('<h1>Node modules is missing</h1>')
          responseBodyLines.push('<p>This happens when you first start using a kit you haven\'t used before.</p>')
          responseBodyLines.push('<p>To fix this run the command</p>')
          responseBodyLines.push('<code>npm install</code><br/>')
          responseBodyLines.push('<button>Run this for me</button>')
          responseBodyLines.push('<p>(this button doesn\'t work, it\'s just an example)</p>')
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
    const port = process.env.PORT || 3000
    const server = http.createServer(requestListener)
    server.listen(port, 'localhost', () => {
      console.log(`Server is running on http://localhost:${port}`)
      lastStarted = JSON.parse(JSON.stringify(new Date()))
    })
    currentServer = server
  },
  triggerStopErrorServer: () => {
    currentServer.close()
  }
}
