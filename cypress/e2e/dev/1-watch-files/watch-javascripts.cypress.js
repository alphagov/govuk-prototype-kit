import path from "path";
import { waitForApplication } from "../../utils.js";
const appJsPath = path.join('app', 'assets', 'javascripts', 'application.js');
const appJs = path.join(Cypress.env('projectFolder'), appJsPath);
const heading = 'Test Heading';
const scriptToAdd = `
  document.querySelector("h1").innerHTML = "${heading}"
`;
describe('watch application.js', () => {
    before(() => {
        // Restore application.js from prototype starter
        cy.task('copyFromStarterFiles', { filename: appJsPath });
    });
    it('changes to application.js should be reflected in browser', () => {
        waitForApplication();
        cy.get('h1').should('not.contain.text', heading);
        const markerText = '// Add JavaScript here';
        cy.task('replaceTextInFile', {
            filename: appJs,
            originalText: markerText,
            newText: markerText + scriptToAdd
        });
        cy.get('h1').contains(heading);
        // Restore application.js from prototype starter
        cy.task('copyFromStarterFiles', { filename: appJsPath });
    });
});
