const { addFilter } = require('govuk-prototype-kit').nunjucks

addFilter('bar__link',
  (content, url) => `<a href="${url || '#'}">${content}</a>`,
  { renderAsHtml: true })
