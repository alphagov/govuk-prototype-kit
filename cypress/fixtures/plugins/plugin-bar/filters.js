// local dependencies
const { addFilter } = require('@nowprototypeit/govuk').views

addFilter('bar__link',
  (content, url) => `<a href="${url || '#'}">${content}</a>`,
  { renderAsHtml: true })
