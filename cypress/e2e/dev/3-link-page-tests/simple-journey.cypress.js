import { waitForApplication } from "../../utils.js";
import { setUpPages, cleanUpPages } from "./link-page-utils.js";
const startPath = '/start';
const howManyBalls = '3 or more';
const mostImpressiveTrick = 'Standing on my head';
describe('Question journey', async () => {
    before(() => {
        cleanUpPages();
        setUpPages();
    });
    it('Happy path journey', () => {
        waitForApplication();
        // Visit start page and click start
        cy.task('log', 'The start page should be displayed');
        cy.visit(startPath);
        cy.get('body').contains('Start now');
        cy.get('a.govuk-button--start').click();
        // On Juggling balls page, click continue
        cy.task('log', 'The juggling balls page should be displayed');
        cy.get('h1').contains('How many balls can you juggle?');
        cy.get(`input[value="${howManyBalls}"]`).check();
        cy.get('button.govuk-button').contains('Continue').click();
        // On Juggling trick page, click continue
        cy.task('log', 'The juggling trick page should be displayed');
        cy.get('h1').contains('What is your most impressive juggling trick?');
        cy.get('textarea#most-impressive-trick').type(mostImpressiveTrick);
        cy.get('button.govuk-button').contains('Continue').click();
        // On Check answers page, click accept and send
        cy.task('log', 'The check answers page should be displayed');
        cy.get('h1').contains('Check your answers before sending your application');
        cy.get('.govuk-summary-list__value:first').contains(howManyBalls);
        cy.get('.govuk-summary-list__value:last').contains(mostImpressiveTrick);
        cy.get('button.govuk-button').contains('Accept and send').click();
        // Confirmation page should be displayed correctly
        cy.task('log', 'The confirmation page should be displayed');
        cy.get('h1.govuk-panel__title').contains('Application complete');
    });
});
