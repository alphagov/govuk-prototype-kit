import path from "path";
import { waitForApplication } from "../../utils.js";
const appStylesPath = path.join('app', 'assets', 'sass');
const appStylesheetPath = path.join(appStylesPath, 'application.scss');
const appStylesFolder = path.join(Cypress.env('projectFolder'), appStylesPath);
const appStylesheet = path.join(Cypress.env('projectFolder'), appStylesheetPath);
const cypressTestStyles = 'cypress-test';
const cypressTestStylePattern = path.join(appStylesFolder, 'patterns', `_${cypressTestStyles}.scss`);
const publicStylesheet = 'public/stylesheets/application.css';
const RED = 'rgb(255, 0, 0)';
const BLACK = 'rgb(11, 12, 12)';
describe('watch sass files', () => {
    describe(`sass file ${cypressTestStylePattern} should be created and included within the ${appStylesheet} and accessible from the browser as /${publicStylesheet}`, () => {
        const cssStatement = `
    .govuk-header { background: red; }
    `;
        before(() => {
            cy.task('deleteFile', { filename: cypressTestStylePattern });
            // Restore application.scss from prototype starter
            cy.task('copyFromStarterFiles', { filename: appStylesheetPath });
        });
        it('The colour of the header should be changed to red then back to black', () => {
            waitForApplication();
            cy.task('log', 'The colour of the header should be black');
            cy.get('.govuk-header').should('have.css', 'background-color', BLACK);
            cy.task('log', `Create ${cypressTestStylePattern}`);
            cy.task('createFile', {
                filename: cypressTestStylePattern,
                data: cssStatement
            });
            cy.task('log', `Amend ${appStylesheet} to import ${cypressTestStyles}`);
            cy.task('appendFile', {
                filename: appStylesheet,
                data: `
      @import "patterns/${cypressTestStyles}";
      `
            });
            cy.task('log', 'The colour of the header should be changed to red');
            cy.get('.govuk-header').should('have.css', 'background-color', RED);
        });
    });
});
