const appFiltersPath = path.join('app', 'filters.js')

const filtersViewMarkup = `
{% extends "layouts/main.html" %}
{% block content %}
<div id="test-foo-strong-filter">{{ 'abc' | foo__strong }}</div>
{% endblock %}
`
const filtersAddition = `
addFilter('foo__strong', (content) => '<strong>' + '${content}' + '</strong>', { renderAsHtml: true })
`

describe('Filters Test', () => {
    before(() => {
        // Restore filters file from prototype starter
        cy.task('copyFromStarterFiles', { filename: appFiltersPath })
        cy.task('appendFile', { filename: appFiltersPath, data: filtersViewMarkup })
        cy.task('createFile', { filename: filtersView, data: filtersViewMarkup })
    })
})