// local dependencies
const { addFilter } = require('@nowprototypeit/govuk').views

addFilter('baz__link',
  (content, url) => `<a href="${url || '#'}">${content}</a>`,
  { renderAsHtml: true })
