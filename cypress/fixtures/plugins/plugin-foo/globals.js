const { addGlobal } = require('govuk-prototype-kit').views
addGlobal('fooEmphasize', (content) => `<em>${content}</em>`, { renderAsHtml: true })
