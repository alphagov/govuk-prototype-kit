const Content = require('../services/content')
const Manual = require('../presenters/manual')

module.exports = {
  show (req, res) {
    let contentPath = req.query.path || 'guidance/immigration-rules'

    Content.getManual(contentPath).then(response => {
      let json = response
      let manual = new Manual(json)
      return res.status(200).render('manual', { content: manual })
    })
  },

  showChapter (req, res) {
    let contentPath = req.query.path || 'guidance/immigration-rules/immigration-rules-introduction'

    Content.getChapter(contentPath).then(response => {
      let json = response
      let manual = new Manual(json)
      return res.status(200).render('chapter', { content: manual, showDeepNav: res.locals.showDeepNav })
    })
  }
}
