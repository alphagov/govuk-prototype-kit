/* eslint-env jest */

// local dependencies
const { getErrorDetails } = require('./errorModel')

describe('getErrorDetails', () => {
  it('should return undefined when the error isn\'t processable', () => {
    expect(getErrorDetails({})).toEqual(undefined)
  })

  it('should process a standard Node error', () => {
    expect(getErrorDetails({
      message: 'Example error',
      stack: [
        'Error: Example error',
        '    at Object.<anonymous> (/Users/example.user/opensource/alphagov/govuk-prototype-kit/playground.js:5:9)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)',
        '    at node:internal/main/run_main_module:23:47'].join('\n')
    })).toEqual({
      message: 'Example error',
      filePath: '/Users/example.user/opensource/alphagov/govuk-prototype-kit/playground.js',
      line: 5,
      column: 9,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it('should process a Node reference error', () => {
    expect(getErrorDetails({
      message: 'lksdf is not defined',
      stack: [
        'ReferenceError: lksdf is not defined',
        '    at Object.<anonymous> (/Users/example.user/prototype-kits/companion-prototype-kit/app/routes.js:11:1)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)',
        '    at require (node:internal/modules/cjs/helpers:110:18)',
        '    at Object.addRouters (/Users/example.user/opensource/alphagov/govuk-prototype-kit/lib/utils/index.js:76:5)',
        '    at Object.<anonymous> (/Users/example.user/opensource/alphagov/govuk-prototype-kit/server.js:137:7)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)'
      ].join('\n')
    })).toEqual({
      message: 'lksdf is not defined',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/routes.js',
      line: 11,
      column: 1,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it('should process a Node end of input error', () => {
    expect(getErrorDetails({
      message: 'Unexpected end of input',
      stack: [
        '/Users/example.user/opensource/alphagov/govuk-prototype-kit/index.js:11',
        '',
        '',
        '',
        'SyntaxError: Unexpected end of input',
        '    at internalCompileFunction (node:internal/vm:73:18)',
        '    at wrapSafe (node:internal/modules/cjs/loader:1176:20)',
        '    at Module._compile (node:internal/modules/cjs/loader:1218:27)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)',
        '    at require (node:internal/modules/cjs/helpers:110:18)',
        '    at Object.<anonymous> (/Users/example.user/opensource/alphagov/govuk-prototype-kit/lib/filters/core-filters.js:3:34)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)'
      ].join('\n')
    })).toEqual({
      message: 'Unexpected end of input',
      filePath: '/Users/example.user/opensource/alphagov/govuk-prototype-kit/index.js',
      line: 11,
      processedBy: 'nodeMatchWithLineColonSeperated'
    })
  })

  it('should process a nunjucks expected variable end error', () => {
    expect(getErrorDetails({
      message: [
        '(/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk) [Line 13, Column 22]',
        '  expected variable end'
      ].join('\n'),
      stack: [
        'Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk) [Line 13, Column 22]',
        '  expected variable end',
        '    at Object._prettifyError (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:36:11)',
        '    at Template.render (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:538:21)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:366:27',
        '    at createTemplate (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:315:9)',
        '    at handle (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:327:11)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:339:9',
        '    at next (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:328:7)',
        '    at Object.asyncIter (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:334:3)',
        '    at Environment.getTemplate (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:321:9)',
        '    at Environment.render (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:360:10)'
      ].join('\n')
    })).toEqual({
      message: 'expected variable end',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      line: 13,
      column: 22,
      processedBy: 'nunjucksMatcherWithLineAndColumnSpelledOut'
    })
  })
  it('should process a nunjucks template not found error', () => {
    expect(getErrorDetails({
      message: '(/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)\n  Error: template not found: layouts/main2.html',
      stack: [
        'Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)',
        '  Error: template not found: layouts/main2.html',
        '    at Object._prettifyError (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:36:11)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:563:19',
        '    at Template.root [as rootRenderFunc] (eval at _compile (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:37:3)',
        '    at Template.render (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:552:10)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:366:27',
        '    at createTemplate (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:315:9)',
        '    at handle (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:327:11)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:339:9',
        '    at next (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:328:7)',
        '    at Object.asyncIter (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:334:3)'
      ].join
    })).toEqual({
      message: 'template not found: layouts/main2.html',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      processedBy: 'nunjucksMatcherA'
    })
  })
  it('should process a nunjucks error using a variable as a function', () => {
    expect(getErrorDetails({
      message: [
        '(/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)',
        '  Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/node_modules/govuk-prototype-kit/lib/nunjucks/govuk-prototype-kit/includes/homepage-top.njk)',
        '  Error: Unable to call `serviceName`, which is not a function'
      ].join('\n'),
      stack: ['Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)',
        '  Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/node_modules/govuk-prototype-kit/lib/nunjucks/govuk-prototype-kit/includes/homepage-top.njk)',
        '  Error: Unable to call `serviceName`, which is not a function',
        '    at Object._prettifyError (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/lib.js:36:11)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:563:19',
        '    at eval (eval at _compile (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:148:12)',
        '    at eval (eval at _compile (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:287:12)',
        '    at eval (eval at _compile (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:57:12)',
        '    at /Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:571:11',
        '    at Template.root [as rootRenderFunc] (eval at _compile (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:22:3)',
        '    at Template.render (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:552:10)',
        '    at eval (eval at _compile (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:56:10)',
        '    at fn (/Users/example.user/opensource/alphagov/govuk-prototype-kit/node_modules/a-sync-waterfall/index.js:26:24)'
      ].join('\n')
    })).toEqual({
      message: 'Unable to call `serviceName`, which is not a function',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      processedBy: 'nunjucksMatcherA'
    })
  })
})
