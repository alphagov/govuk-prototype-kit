import { installPlugin, waitForApplication } from "../../utils.js";
import { showHideAllLinkQuery, assertVisible, assertHidden } from "../../step-by-step-utils.js";
import { manageTemplatesPagePath, getTemplateLink } from "../plugin-utils.js";
const plugin = '@govuk-prototype-kit/step-by-step';
const pluginName = 'Step By Step';
const pluginPageTemplate = '/templates/step-by-step-navigation.html';
const pluginPageTitle = 'Step by step navigation';
describe('Management plugins: ', () => {
    before(() => {
        cy.task('log', 'Visit the manage prototype plugins page');
        installPlugin(plugin, 'latest');
    });
    it(`Preview a ${plugin} template`, () => {
        waitForApplication(manageTemplatesPagePath);
        cy.get('h2').contains(pluginName);
        cy.task('log', `Preview the ${pluginPageTitle} template`);
        cy.get(`a[href="${getTemplateLink('view', '@govuk-prototype-kit/step-by-step', pluginPageTemplate)}"]`).click();
        cy.task('log', `Prove the ${pluginName} functionality works`);
        assertHidden(1);
        assertHidden(2);
        cy.get(showHideAllLinkQuery).contains('Show all').click();
        assertVisible(1);
        assertVisible(2);
    });
});
