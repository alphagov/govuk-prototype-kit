const { addFilter, getFilter } = require('govuk-prototype-kit').nunjucks

const safe = getFilter('safe')
addFilter('foo__strong', (content) => safe(`<strong>${content}</strong>`))
