import { waitForApplication } from "../../utils.js";
import { setUpPages, setUpData, cleanUpPages } from "./link-page-utils.js";
const checkAnswersPath = '/check-answers';
const howManyBalls = '3 or more';
const mostImpressiveTrick = 'Standing on my head';
const defaultHowManyBalls = 'None - I cannot juggle';
const defaultMostImpressiveTrick = 'None - I cannot do tricks';
describe('Change answers', async () => {
    before(() => {
        cleanUpPages();
        setUpPages();
        setUpData();
    });
    it('Change juggling balls journey', () => {
        // Visit Check answers page, click change juggling balls
        waitForApplication();
        cy.task('log', 'The check answers page should be displayed');
        cy.visit(checkAnswersPath);
        cy.get('h1').contains('Check your answers before sending your application');
        cy.get('.govuk-summary-list__value:first').contains(defaultHowManyBalls);
        cy.get('.govuk-summary-list__value:last').contains(defaultMostImpressiveTrick);
        cy.get('a[href="/juggling-balls"]').contains('Change').click();
        // On Juggling balls page, click continue
        cy.task('log', 'The juggling balls page should be displayed');
        cy.get('h1').contains('How many balls can you juggle?');
        cy.get(`input[value="${defaultHowManyBalls}"]`).should('be.checked');
        cy.get(`input[value="${howManyBalls}"]`).check();
        cy.get('button.govuk-button').contains('Continue').click();
        // On Juggling trick page, click continue
        cy.task('log', 'The juggling trick page should be displayed');
        cy.get('h1').contains('What is your most impressive juggling trick?');
        cy.get('textarea#most-impressive-trick').contains(defaultMostImpressiveTrick);
        cy.get('button.govuk-button').contains('Continue').click();
        // On Check answers page, click accept and send
        cy.task('log', 'The check answers page should be displayed');
        cy.get('h1').contains('Check your answers before sending your application');
        cy.get('.govuk-summary-list__value:first').contains(howManyBalls);
        cy.get('.govuk-summary-list__value:last').contains(defaultMostImpressiveTrick);
    });
    it('Change juggling trick journey', () => {
        // Visit Check answers page, click change juggling trick
        waitForApplication();
        cy.task('log', 'The check answers page should be displayed');
        cy.visit(checkAnswersPath);
        cy.get('h1').contains('Check your answers before sending your application');
        cy.get('.govuk-summary-list__value:first').contains(defaultHowManyBalls);
        cy.get('.govuk-summary-list__value:last').contains(defaultMostImpressiveTrick);
        cy.get('a[href="/juggling-trick"]').contains('Change').click();
        // On Juggling trick page, click continue
        cy.task('log', 'The juggling trick page should be displayed');
        cy.get('h1').contains('What is your most impressive juggling trick?');
        cy.get('textarea#most-impressive-trick').contains(defaultMostImpressiveTrick).type(mostImpressiveTrick);
        cy.get('button.govuk-button').contains('Continue').click();
        // On Check answers page, click accept and send
        cy.task('log', 'The check answers page should be displayed');
        cy.get('h1').contains('Check your answers before sending your application');
        cy.get('.govuk-summary-list__value:first').contains(defaultHowManyBalls);
        cy.get('.govuk-summary-list__value:last').contains(mostImpressiveTrick);
    });
});
