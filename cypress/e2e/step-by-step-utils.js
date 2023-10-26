const showHideAllLinkQuery = '.app-step-nav__controls button'
const toggleButtonQuery = (step) => `[data-position="${step}"]`
const showHideLinkQuery = (step) => `[data-position="${step}"]`
const panelQuery = (step) => `[data-position="${step}.1"]`
const titleQuery = (step) => `[data-position="${step}"] .js-step-title-text`

const assertVisible = (step) => {
  cy.get(showHideLinkQuery(step)).contains('Hide')
  cy.get(panelQuery(step)).should('be.visible')
}

const assertHidden = (step) => {
  cy.get(panelQuery(step)).should('not.be.visible')
  cy.get(showHideLinkQuery(step)).contains('Show')
}

module.exports = {
  showHideAllLinkQuery,
  toggleButtonQuery,
  showHideLinkQuery,
  titleQuery,
  assertVisible,
  assertHidden
}
