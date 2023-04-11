import path from "path";
import { waitForApplication } from "../../utils.js";
const appViews = path.join(Cypress.env('projectFolder'), 'app', 'views');
const pluginFooBarView = path.join(appViews, 'plugin-foo-bar.html');
const WHITE = 'rgb(255, 255, 255)';
const RED = 'rgb(255, 0, 0)';
const YELLOW = 'rgb(255, 255, 0)';
const BLUE = 'rgb(0, 0, 255)';
const pluginFooBarCombinedViewMarkup = `
{% extends "layouts/main.html" %}

{% block content %}
{% set testVar="Hello" %}
<h1 class="test-foo test-bar">Plugin Foo Bar</h1>
<p id="filter-test-foo">{{testVar | foo__strong}}</p>
<p id="filter-test-bar">{{testVar | bar__link('https://gov.uk/')}}</p>
{% endblock %}

{% block pageScripts %}
<script>
  window.GOVUKPrototypeKit.documentReady(() => {
    new window.BAR.Modules.PluginBar('.test-bar')
    new window.FOO.Modules.PluginFoo('.test-foo')
  })
</script>
{% endblock %}
`;
describe('Multiple Plugin test', async () => {
    before(() => {
        cy.task('createFile', { filename: pluginFooBarView, data: pluginFooBarCombinedViewMarkup });
    });
    describe('Plugin Bar', () => {
        it('Loads plugin-bar view correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('.plugin-bar')
                .should('contains.text', 'Plugin Foo Bar');
        });
        it('Loads plugin-bar style correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('.plugin-bar')
                .should('have.css', 'background-color', YELLOW)
                .should('have.css', 'border-color', WHITE);
        });
        it('Loads plugin-bar script correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('.plugin-bar').click();
            cy.get('.plugin-bar')
                .should('have.css', 'background-color', BLUE)
                .should('have.css', 'border-color', RED);
        });
        it('Uses the foo filter correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('#filter-test-bar')
                .should('contain.html', '<a href="https://gov.uk/">Hello</a>');
        });
    });
    describe('Plugin Foo', () => {
        it('Loads plugin-foo view correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('.plugin-foo')
                .should('contains.text', 'Plugin Foo Bar');
        });
        it('Loads plugin-foo style correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('.plugin-foo')
                .should('have.css', 'background-color', YELLOW)
                .should('have.css', 'border-color', WHITE);
        });
        it('Loads plugin-foo script correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('.plugin-foo').click();
            cy.get('.plugin-foo').should('have.css', 'background-color', BLUE)
                .should('have.css', 'border-color', RED);
        });
        it('Uses the bar filter correctly', () => {
            waitForApplication();
            cy.visit('/plugin-foo-bar');
            cy.get('#filter-test-foo')
                .should('contain.html', '<strong>Hello</strong>');
        });
    });
});
