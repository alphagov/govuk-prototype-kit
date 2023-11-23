const { addFunction } = require('govuk-prototype-kit').views
addFunction('foo.styles.emphasize', (content) => `<em>${content}</em>`, { renderAsHtml: true })
