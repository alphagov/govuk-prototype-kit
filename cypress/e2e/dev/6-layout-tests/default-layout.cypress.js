
// core dependencies
const path = require('path')

// local dependencies
const { waitForApplication } = require('../../utils')

const defaultLayoutFilePath = path.join('app', 'views', 'layouts', 'main.html')
const backupLayoutComment = '<!-- could not find layouts/main.html in prototype, using backup default template -->'

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

  cy.document().then(doc =>
    comments(doc.head).should('contain', backupLayoutComment)
  )
})

it('should still render user\'s layout when renamed to .njk', () => {
  waitForApplication()
  cy.visit('/')

  cy.document().then(doc =>
    comments(doc.head).should('not.contain', backupLayoutComment)
  )

  const originalFilePath = path.join(Cypress.env('projectFolder'), defaultLayoutFilePath)

  cy.task('copyFile', { source: originalFilePath, target: originalFilePath.replace('.html', '.njk') })
  cy.task('deleteFile', { filename: originalFilePath })

  cy.visit('/', { failOnStatusCode: false })
  cy.get('body').should('not.contains.text', 'Error: template not found')

  cy.document().then(doc =>
    comments(doc.head).should('not.contain', backupLayoutComment)
  )
})
