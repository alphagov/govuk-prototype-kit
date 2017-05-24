const Content = require('../services/content')
const HtmlPublication = require('../presenters/htmlPublication')

module.exports = {
  show (req, res) {
    let contentPath = req.query.path || 'government/publications/vat-notice-700-the-vat-guide/vat-notice-700-the-vat-guide'

    Content.get(contentPath).then(response => {
      let json = response.getBody()
      let publication = new HtmlPublication(json, 'html_publication')
      return res.status(200).render('format', { content: publication })
    })
  }
}
