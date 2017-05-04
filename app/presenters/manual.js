const $ = require('cheerio')

const ContentItem = require('./contentItem')

const Manual = class extends ContentItem {
  getChapters () {
    return this.json.chapters
  }

  contentsLink () {
    let link = ''

    if (this.json.links.manual) {
      link = this.json.links.manual[0].base_path
    } else {
      link = this.json.base_path
    }

    return `/manual?${link}`
  }

  isChapter () {
    return this.json.links.manual
  }

  contentsList () {
    return this.getChapters().map(c => {
      let listItem = { title: c.title, description: c.description, link: `/manual/chapter?path=${c.base_path}` }

      if (c.base_path === this.json.base_path) {
        listItem.subItems = this.chapterContents()
      }
      return listItem
    })
  }

  chapterContents () {
    let $headings = $.load(this.json.details.body)('h2[id]')
    let contents = []

    $headings.each((i, h) => {
      let $this = $(h)
      contents.push({ title: $this.text(), link: `#${$this.attr('id')}` })
    })

    return contents
  }
}

module.exports = Manual
