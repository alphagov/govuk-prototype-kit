const requestify = require('requestify')
const govUkBasePath = 'https://www.gov.uk/api/content/'

const Content = {}

Content.get = function (path) {
  let resource = `${govUkBasePath}${path}`
  return requestify.get(resource)
}

Content.getManual = function (path) {
  return this.get(path).then(response => {
    let manual = response.getBody()
    // manual.links.sections.shift()
    manual.chapters = manual.links.sections
    return manual
  })
}

Content.getChapter = function (path) {
  return this.get(path).then(response => {
    let chapter = response.getBody()
    let manualPath = chapter.links.manual[0].base_path
    return this.getManual(manualPath).then(manual => {
      chapter.chapters = manual.chapters
      return chapter
    })
  })
}

module.exports = Content
