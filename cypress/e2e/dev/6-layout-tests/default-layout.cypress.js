
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const defaultLayoutFilePath = path.join('app', 'views', 'layouts', 'main.html')
const backupLayoutComment = '<!-- could not find layouts/main.html or layouts/main.njk in prototype, using backup default template -->'

const comments = el => cy.wrap(
  [...el.childNodes]
    .filter(node => node.nodeName === '#comment')
    .map(commentNode => '<!--' + commentNode.data + '-->')
)

before(() => {
  cy.task('copyFromStarterFiles', { filename: defaultLayoutFilePath })
})

it('deleting default layout does not cause pages to fail to render', () => {
  waitForApplication()
  cy.visit('/')

  cy.document().then(doc =>
    comments(doc.head).should('not.contain', backupLayoutComment)
  )

  cy.task('deleteFile', { filename: path.join(Cypress.env('projectFolder'), defaultLayoutFilePath) })

  cy.visit('/', { failOnStatusCode: false })
  cy.get('body').should('not.contains.text', 'Error: template not found')

  cy.document().then(doc => {
    cy.log('head content', doc.head.innerHTML)
    comments(doc.head).should('contain', backupLayoutComment)
  })
})
