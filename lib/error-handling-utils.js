const path = require("path");
const {projectDir} = require("./utils/paths");
const {promises: fs} = require("fs");

function escapeHtmlchars(input) {
  return input.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/  /g, '&nbsp;&nbsp;')
}

function formatForHtml(input) {
  return escapeHtmlchars(input).split('\n').join('<br/>\n')
}

function formatForHtmlWithLineNumbers(input) {
  return escapeHtmlchars(input).split('\n').map((x, index) => `<div class="line-${index + 1} code-line"><span class="line-number">${index + 1}</span>${x}</div>`).join('\n')
}

function getErrorStyles(inputLinesToHighlight = []) {
  let highlightLines = ''
  if (inputLinesToHighlight.length > 0) {
    highlightLines = `${inputLinesToHighlight.map(x => `.line-${x}`)} {
    background: red;
    color: white;
  }`
  }
  return `<style>
  .code {
    overflow: scroll;
  }
  code {
    display: block;
    width: 2000px;
  }
  .code-line {
    line-height: 1.5;
    font-family: monospace;
    font-size: 1.2em;
  }
  .line-number {
    display: inline-block;
    width: 40px;
  }
  ${highlightLines}
</style>`
}

async function prepareNiceError(filePath, message, line, column) {
  const pathFromAppRoot = path.relative(projectDir, filePath)
  let codeArea = 'This is an error in your code'

  if (pathFromAppRoot.startsWith('node_modules')) {
    const pluginName = pathFromAppRoot.split('/')[1]
    codeArea = `This error comes from the "${pluginName}" plug-in. Please contact them to report the issue.  This is not an error in your code but you might be able to change your code to work around it.`
  }

  const originalFileContents = await fs.readFile(filePath, 'utf8')

  const formattedFileContents = formatForHtmlWithLineNumbers(originalFileContents)
  const highlightLines = []
  if (line) {

    const trimmedLines = originalFileContents.split('\n').map(x => x.replace(/\s/g, ''))

    highlightLines.push(line)
    if (
      message.startsWith('unexpected token') ||
      message.endsWith('expected') ||
      message.startsWith('SyntaxError: Unexpected')) {
      let currentLine = line
      do {
        currentLine--
        highlightLines.push(Number(currentLine))
      } while (
        trimmedLines[currentLine - 1].length === 0
      ||
        trimmedLines[currentLine - 1].startsWith('//')
        )
    }
  }

  return {
    pathFromAppRoot,
    codeArea,
    formattedFileContents,
    highlightLines
  }
}

module.exports = {
  formatForHtml,
  formatForHtmlWithLineNumbers,
  getErrorStyles,
  prepareNiceError
}
