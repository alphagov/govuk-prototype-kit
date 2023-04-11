/**
 * Adds command "cy.waitForResource(name)" that checks performance entries
 * for resource that ends with the given name.
 *
 * @see https://developers.google.com/web/tools/chrome-devtools/network/understanding-resource-timing
 *
 * Copied from https://github.com/cypress-io/cypress-example-recipes/blob/434f3b9b62555e53134c160b1f051b0c74a714e2/examples/testing-dom__wait-for-resource/cypress/e2e/spec.cy.js
 */
Cypress.Commands.add('waitForResource', (name, options = {}) => {
    if (Cypress.browser.family === 'firefox') {
        cy.log('Skip waitForResource in Firefox');
        return;
    }
    cy.log(`Waiting for resource ${name}`);
    const log = false; // let's not log inner commands
    const timeout = options.timeout || Cypress.config('defaultCommandTimeout');
    cy.window({ log }).then(
    // note that ".then" method has options first, callback second
    // https://on.cypress.io/then
    { log, timeout }, (win) => {
        return new Cypress.Promise((resolve, reject) => {
            let foundResource;
            // control how long we should try finding the resource
            // and if it is still not found. An explicit "reject"
            // allows us to show nice informative message
            setTimeout(() => {
                if (foundResource) {
                    // nothing needs to be done, successfully found the resource
                    return;
                }
                clearInterval(interval);
                reject(new Error(`Timed out waiting for resource ${name}`));
            }, timeout);
            const interval = setInterval(() => {
                foundResource = win.performance
                    .getEntriesByType('resource')
                    .find((item) => item.name.endsWith(name));
                if (!foundResource) {
                    // resource not found, will try again
                    return;
                }
                clearInterval(interval);
                // because cy.log changes the subject, let's resolve the returned promise
                // with log + returned actual result
                resolve(cy.log('✅ success').then(() => {
                    // let's resolve with the found performance object
                    // to allow tests to inspect it
                    return foundResource;
                }));
            }, 100);
        });
    });
});
Cypress.Commands.add('download', { prevSubject: true }, (subject) => {
    return cy.get(subject)
        .invoke('attr', 'href')
        .then((filename) => {
        cy.url().then((uri) => {
            const url = new URL(uri);
            cy.task('log', `Downloading ${url.origin}${filename}`);
            cy.task('download', { filename: `${url.origin}${filename}` });
        });
    });
});
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
