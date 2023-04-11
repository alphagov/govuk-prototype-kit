specify('index page', () => {
    cy.visit('/');
    cy.get('h2').contains('GOV.UK Prototype Kit');
});
specify('GOV.UK Frontend fonts loaded', () => {
    cy.visit('/');
    const fontUrl = '/plugin-assets/govuk-frontend/govuk/assets/fonts/bold-b542beb274-v2.woff2';
    cy.task('log', 'Requesting govuk-frontend font');
    cy.request(`/${fontUrl}`, { retryOnStatusCodeFailure: true })
        .then(response => expect(response.status).to.eq(200));
    cy.task('log', 'Check page has loaded fonts successfully');
    cy.document()
        .invoke('fonts.check', '16px GDS Transport')
        .should('be.true');
});
