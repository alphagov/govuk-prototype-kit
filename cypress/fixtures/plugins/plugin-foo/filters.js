const { addFilter } = require('@nowprototypeit/govuk').views
addFilter('foo__strong', (content) => `<strong>${content}</strong>`, { renderAsHtml: true })
