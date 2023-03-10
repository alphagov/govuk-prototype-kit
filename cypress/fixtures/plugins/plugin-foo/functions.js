const { addFunction } = require('govuk-prototype-kit').views
addFunction('fooEmphasize', (content) => `<em>${content}</em>`, { renderAsHtml: true })
