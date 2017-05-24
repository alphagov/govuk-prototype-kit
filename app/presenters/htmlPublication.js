const $ = require('cheerio')

const ContentItem = require('./contentItem')

const HtmlPublication = class extends ContentItem {
  contentsList () {
    let $headings = $.load(this.json.details.headings)('li a')
    let contents = []

    $headings.each((i, h) => {
      let $this = $(h)
      let re = new RegExp(/^\d/)
      let text = $this.text()
      let isNumberedItem = re.test(text)
      let itemNumber
      let formattedText = text

      if (isNumberedItem) {
        formattedText = text.split('. ')[1]
        itemNumber = text.split('. ')[0]
      }

      contents.push({ title: formattedText, link: $this.attr('href'), isNumberedItem: isNumberedItem, itemNumber: itemNumber })
    })

    return contents
  }
}

module.exports = HtmlPublication
