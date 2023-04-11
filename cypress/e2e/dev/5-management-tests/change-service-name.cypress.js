import path from "path";
import { waitForApplication } from "../../utils.js";
const appIndexPath = path.join('app', 'views', 'index.html');
const appConfigPath = path.join('app', 'config.json');
const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath);
const originalText = 'Service name goes here';
const newText = 'Cypress test';
const serverNameQuery = 'a.govuk-header__link.govuk-header__service-name, a.govuk-header__link--service-name';
const managePagePath = '/manage-prototype';
describe('change service name', () => {
    before(() => {
        // Restore index.html and config.json from prototype starter
        cy.task('copyFromStarterFiles', { filename: appConfigPath });
        cy.task('copyFromStarterFiles', { filename: appIndexPath });
    });
    it('The service name should change to "cypress test" and the task should be set to "Done"', () => {
        waitForApplication();
        cy.task('log', 'Visit the index page and navigate to the manage your prototype page');
        cy.visit('/');
        cy.get('.govuk-heading-xl').contains(originalText);
        cy.get('p strong').contains(appConfigPath);
        cy.get(`main a[href="${managePagePath}"]`).contains('Manage your prototype').click();
        cy.task('log', 'Visit the manage prototype page');
        cy.get(serverNameQuery).contains(originalText);
        cy.get('.app-task-list__item')
            .contains(appConfigPath)
            .get('.app-task-list__tag').contains('To do');
        cy.task('replaceTextInFile', { filename: appConfig, originalText, newText });
        waitForApplication(managePagePath);
        cy.get(serverNameQuery).contains(newText);
        cy.get('.app-task-list__item')
            .contains(appConfigPath)
            .get('.app-task-list__tag').contains('Done');
        cy.visit('/index');
        cy.get('.govuk-heading-xl').contains(newText);
    });
});
