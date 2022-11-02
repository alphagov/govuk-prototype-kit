specify('index page', () => {
  cy.visit('/')
  cy.contains('GOV.UK Prototype Kit')
})

specify('govuk-frontend fonts loaded', () => {
  cy.visit('/')

  const fontUrl = '/extension-assets/govuk-frontend/govuk/assets/fonts/bold-b542beb274-v2.woff2'

  cy.task('log', 'Requesting govuk-frontend font')
  cy.request(`/${fontUrl}`, { retryOnStatusCodeFailure: true })
    .then(response => expect(response.status).to.eq(200))
})
