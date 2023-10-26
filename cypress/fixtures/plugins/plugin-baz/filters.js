// local dependencies
const { addFilter } = require('govuk-prototype-kit').views

addFilter('baz__link',
  (content, url) => `<a href="${url || '#'}">${content}</a>`,
  { renderAsHtml: true })
