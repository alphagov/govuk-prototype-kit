const { addFunction } = require('@nowprototypeit/govuk').views
addFunction('fooEmphasize', (content) => `<em>${content}</em>`, { renderAsHtml: true })
