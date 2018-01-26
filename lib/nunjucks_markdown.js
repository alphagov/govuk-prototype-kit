const nunjucks = require('nunjucks')
const marked = require('marked')

function MarkdownContent () {
  this.tags = ['markdown']

  this.parse = function (parser, nodes, lexer) {
    let token = parser.nextToken()
    let args = parser.parseSignature(null, true)

    parser.advanceAfterBlockEnd(token.value)

    let body = parser.parseUntilBlocks('error', 'endmarkdown')
    let errorBody = null

    if (parser.skipSymbol('error')) {
      parser.skip(lexer.TOKEN_BLOCK_END)
      errorBody = parser.parseUntilBlocks('endmarkdown')
    }

    let tabStart = new nodes.NodeList(0, 0, [new nodes.Output(0, 0, [new nodes.TemplateData(0, 0, (token.colno - 1))])])

    parser.advanceAfterBlockEnd()

    return new nodes.CallExtension(this, 'run', args, [body, errorBody, tabStart])
  }

  this.run = function (context, body, errorBody, tabStart) {
    let spacesRegex = /^[\s]+/

    tabStart = tabStart()
    body = body()

    // Normalise the content indentation to the {% markdown %} tag depth
    // Credit to https://github.com/zephraph/nunjucks-markdown/blob/master/lib/markdown_tag.js
    if (tabStart > 0) {
      body = body.split(/\r?\n/)

      body = body.map(function (line) {
        let startSpaces = line.match(spacesRegex)

        if (startSpaces && startSpaces[0].length >= tabStart) {
          return line.slice(tabStart)
        } else if (startSpaces) {
          return line.slice(startSpaces[0].length)
        } else {
          return line
        }
      })

      body = body.join('\n')
    }

    return new nunjucks.runtime.SafeString('<div class="markdown">' + marked(body) + '</div>')
  }
}

module.exports = MarkdownContent
