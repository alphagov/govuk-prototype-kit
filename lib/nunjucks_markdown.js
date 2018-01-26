var nunjucks = require('nunjucks')
var marked = require('marked')

function MarkdownContent () {
  this.tags = ['markdown']

  this.parse = function (parser, nodes, lexer) {
    var token = parser.nextToken()
    var args = parser.parseSignature(null, true)

    parser.advanceAfterBlockEnd(token.value)

    var body = parser.parseUntilBlocks('error', 'endmarkdown')
    var errorBody = null

    if (parser.skipSymbol('error')) {
      parser.skip(lexer.TOKEN_BLOCK_END)
      errorBody = parser.parseUntilBlocks('endmarkdown')
    }

    parser.advanceAfterBlockEnd()

    return new nodes.CallExtension(this, 'run', args, [body, errorBody])
  }

  this.run = function (context, body, errorBody) {
    return new nunjucks.runtime.SafeString('<div class="docs markdown">' + marked(body()) + '</div>')
  }
}

module.exports = MarkdownContent
