const { addFilter, getFilter } = require('govuk-prototype-kit').views

const safe = getFilter('safe')
addFilter('foo__strong', (content) => safe(`<strong>${content}</strong>`))
