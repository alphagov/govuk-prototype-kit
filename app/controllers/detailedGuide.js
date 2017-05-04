const Content = require('../services/content')
const DetailedGuide = require('../presenters/detailedGuide')

module.exports = {
  show (req, res) {
    let contentPath = req.query.path || 'guidance/tree-preservation-orders-and-trees-in-conservation-areas'

    Content.get(contentPath).then(response => {
      let json = response.getBody()
      let guide = new DetailedGuide(json)
      return res.status(200).render('format', { content: guide })
    })
  }
}
