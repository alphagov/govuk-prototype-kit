const $ = require('cheerio')

const ContentItem = require('./contentItem')

const HtmlPublication = class extends ContentItem {
  contentsList () {
    let $headings = $.load(this.json.details.headings)('li a')
    let contents = []

    $headings.each((i, h) => {
      let $this = $(h)
      let re = new RegExp(/^\d/)
      let isNumberedItem = re.test($this.text())

      contents.push({ title: $this.text(), link: $this.attr('href'), isNumberedItem: isNumberedItem })
    })

    return contents
  }
}

module.exports = HtmlPublication
