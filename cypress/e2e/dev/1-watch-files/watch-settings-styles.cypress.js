import path from "path";
import { waitForApplication, createFile, deleteFile, replaceInFile } from "../../utils.js";
const appStylesPath = path.join('app', 'assets', 'sass');
const appStylesFolder = path.join(Cypress.env('projectFolder'), appStylesPath);
const settingsStyle = path.join(appStylesFolder, 'settings.scss');
const RED = 'rgb(255, 0, 0)';
const GREEN = 'rgb(0, 255, 0)';
const settingsContent = `$govuk-brand-colour: ${RED}`;
const changedSettingsContent = `$govuk-brand-colour: ${GREEN}`;
describe('watching settings.scss', () => {
    before(() => {
        cy.task('deleteFile', { filename: settingsStyle });
    });
    it('Successfully reload settings changes', () => {
        waitForApplication();
        cy.task('log', 'The colour of the header bottom border should be as designed');
        cy.get('.govuk-header__container').should('not.have.css', 'border-bottom-color', RED);
        createFile(settingsStyle, { data: settingsContent });
        waitForApplication();
        cy.task('log', 'The colour of the header bottom border should be changed to red');
        cy.get('.govuk-header__container').should('have.css', 'border-bottom-color', RED);
        replaceInFile(settingsStyle, settingsContent, '', changedSettingsContent);
        waitForApplication();
        cy.task('log', 'The colour of the header bottom border should be changed to green');
        cy.get('.govuk-header__container').should('have.css', 'border-bottom-color', GREEN);
        deleteFile(settingsStyle);
        waitForApplication();
        cy.task('log', 'The colour of the header bottom border should be as designed');
        cy.get('.govuk-header__container').should('not.have.css', 'border-bottom-color', GREEN);
    });
});
