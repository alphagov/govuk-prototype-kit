const $ = require('cheerio')

const ContentItem = require('./contentItem')

const DetailedGuide = class extends ContentItem {
  contentsList () {
    let $headings = $.load(this.json.details.body)('h2[id]')
    let contents = []

    $headings.each((i, h) => {
      let $this = $(h)
      contents.push({ title: $this.text(), link: `#${$this.attr('id')}` })
    })

    return contents
  }
}

module.exports = DetailedGuide
