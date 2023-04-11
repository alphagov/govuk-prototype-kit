import path from "path";
import { waitForApplication } from "../../utils.js";
const templatesView = path.join(Cypress.config('fixturesFolder'), 'views', 'start.html');
const appView = path.join(Cypress.env('projectFolder'), 'app', 'views', 'start.html');
const pagePath = '/start';
describe('watching start page', () => {
    before(() => {
        cy.task('deleteFile', { filename: appView });
    });
    it('Add and remove the start page', () => {
        waitForApplication();
        cy.task('log', 'The start page should not be found');
        cy.visit(pagePath, { failOnStatusCode: false });
        cy.get('body')
            .should('contains.text', `There is no page at ${pagePath}`);
        cy.task('log', `Copy ${templatesView} to ${appView}`);
        cy.task('copyFile', { source: templatesView, target: appView });
        cy.task('log', 'The start page should be displayed');
        cy.visit(pagePath);
        cy.get('.govuk-button--start')
            .should('contains.text', 'Start now');
    });
});
