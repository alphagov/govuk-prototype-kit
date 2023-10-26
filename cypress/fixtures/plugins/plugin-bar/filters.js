// local dependencies
const { addFilter } = require('govuk-prototype-kit').views

addFilter('bar__link',
  (content, url) => `<a href="${url || '#'}">${content}</a>`,
  { renderAsHtml: true })
