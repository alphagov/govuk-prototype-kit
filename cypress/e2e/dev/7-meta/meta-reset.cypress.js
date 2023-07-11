const { restoreStarterFiles } = require('../../utils')
const path = require('path')

describe('Meta - Reset', async () => {
  afterEach(restoreStarterFiles)

  const fileToCreate = path.join(Cypress.env('projectFolder'), 'app', 'views', 'hello.html')

  it('creates a file', () => {
    cy.log(fileToCreate)

    cy.task('createFile', { filename: fileToCreate, data: 'This is the content' })

    cy.task('doesFileExist', { filename: fileToCreate })
      .should('eq', true)
  })

  it('should have deleted the file', () => {
    cy.task('doesFileExist', { filename: fileToCreate })
      .should('eq', false)
  })

  describe('delete a file', () => {
    const filename = path.join(Cypress.env('projectFolder'), 'app', 'views', 'index.html')

    it('delete a file', () => {
      cy.log(filename)

      cy.task('deleteFile', { filename, data: 'This is the content' })

      cy.task('doesFileExist', { filename })
        .should('eq', false)
    })

    it('should have recreated the file', () => {
      cy.task('doesFileExist', { filename })
        .should('eq', true)

      cy.task('readFile', { filename: path.join(Cypress.env('starterDir'), 'app', 'views', 'index.html') })
        .then(expected => cy.task('readFile', { filename })
          .should('eq', expected))
    })
  })

  describe('Updating a file', () => {
    const filename = path.join(Cypress.env('projectFolder'), 'app', 'views', 'index.html')
    let originalContents

    it('creates a file', () => {
      cy.log(filename)

      cy.task('readFile', { filename })
        .then(result => { originalContents = result })

      cy.task('deleteFile', { filename })

      cy.task('doesFileExist', { filename })
        .should('eq', false)
    })

    it('should revert the file', () => {
      cy.task('doesFileExist', { filename })
        .should('eq', true)

      cy.task('readFile', { filename: path.join(Cypress.env('starterDir'), 'app', 'views', 'index.html') })
        .should('eq', originalContents)
    })
  })
})
