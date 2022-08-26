const addFilter = require('govuk-prototype-kit').nunjucks.addFilter

addFilter('sayHi', (name, tone) => (tone === 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!')
