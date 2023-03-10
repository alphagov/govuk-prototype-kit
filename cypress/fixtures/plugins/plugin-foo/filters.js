const { addFilter } = require('govuk-prototype-kit').views
addFilter('foo__strong', (content) => `<strong>${content}</strong>`, { renderAsHtml: true })
