import path from "path";
import { waitForApplication } from "../../utils.js";
const appConfigPath = path.join('app', 'config.json');
const appConfig = path.join(Cypress.env('projectFolder'), appConfigPath);
const originalText = 'Service name goes here';
const newText = 'Cypress test';
const serverNameQuery = 'a.govuk-header__link.govuk-header__service-name, a.govuk-header__link--service-name';
describe('watch config file', () => {
    describe(`service name in config file ${appConfig} should be changed and restored`, () => {
        before(() => {
            // Restore config.json from prototype starter
            cy.task('copyFromStarterFiles', { filename: appConfigPath });
        });
        it('The service name should change to "cypress test"', () => {
            waitForApplication();
            cy.visit('/');
            cy.get(serverNameQuery).contains(originalText);
            cy.task('replaceTextInFile', { filename: appConfig, originalText, newText });
            waitForApplication();
            cy.get(serverNameQuery).contains(newText);
        });
    });
});
