/* eslint-env jest */

// local dependencies
const { getErrorDetails } = require('./errorModel')

describe('getErrorDetails', () => {
  const windowsCwd = 'X:\\Users\\example.user\\my-prototype'
  const unixCwd = '/Users/example.user/my-prototype'
  const defaultError = {}

  it('should return undefined when the error isn\'t processable', () => {
    expect(getErrorDetails(unixCwd, {})).toEqual(defaultError)
  })

  it('should process a standard Node error', () => {
    expect(getErrorDetails(unixCwd, {
      message: 'Example error',
      stack: [
        'Error: Example error',
        '    at Object.<anonymous> (/Users/example.user/my-prototype/playground.js:5:9)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)',
        '    at node:internal/main/run_main_module:23:47'].join('\n')
    })).toEqual({
      message: 'Example error',
      filePath: '/Users/example.user/my-prototype/playground.js',
      normalisedFilePath: 'playground.js',
      line: 5,
      column: 9,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it('should process a Node reference error', () => {
    expect(getErrorDetails('/Users/example.user/prototype-kits/companion-prototype-kit', {
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
        '    at Object.addRouters (/Users/example.user/my-prototype/lib/utils/index.js:76:5)',
        '    at Object.<anonymous> (/Users/example.user/my-prototype/server.js:137:7)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)'
      ].join('\n')
    })).toEqual({
      message: 'lksdf is not defined',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/routes.js',
      normalisedFilePath: 'app/routes.js',
      line: 11,
      column: 1,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it('should process a Node end of input error', () => {
    expect(getErrorDetails(unixCwd, {
      message: 'Unexpected end of input',
      stack: [
        '/Users/example.user/my-prototype/index.js:11',
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
        '    at Object.<anonymous> (/Users/example.user/my-prototype/lib/filters/core-filters.js:3:34)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)'
      ].join('\n')
    })).toEqual({
      message: 'Unexpected end of input',
      filePath: '/Users/example.user/my-prototype/index.js',
      normalisedFilePath: 'index.js',
      line: 11,
      processedBy: 'nodeMatchWithLineColonSeperated'
    })
  })

  it('should process a nunjucks expected variable end error', () => {
    expect(getErrorDetails(unixCwd, {
      message: [
        '(/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk) [Line 13, Column 22]',
        '  expected variable end'
      ].join('\n'),
      stack: [
        'Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk) [Line 13, Column 22]',
        '  expected variable end',
        '    at Object._prettifyError (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:36:11)',
        '    at Template.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:538:21)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:366:27',
        '    at createTemplate (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:315:9)',
        '    at handle (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:327:11)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:339:9',
        '    at next (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:328:7)',
        '    at Object.asyncIter (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:334:3)',
        '    at Environment.getTemplate (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:321:9)',
        '    at Environment.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:360:10)'
      ].join('\n')
    })).toEqual({
      message: 'expected variable end',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      normalisedFilePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      line: 13,
      column: 22,
      processedBy: 'nunjucksMatcherWithLineAndColumnSpelledOut'
    })
  })
  it('should process a nunjucks template not found error', () => {
    expect(getErrorDetails(unixCwd, {
      message: '(/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)\n  Error: template not found: layouts/main2.html',
      stack: [
        'Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)',
        '  Error: template not found: layouts/main2.html',
        '    at Object._prettifyError (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:36:11)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:563:19',
        '    at Template.root [as rootRenderFunc] (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:37:3)',
        '    at Template.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:552:10)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:366:27',
        '    at createTemplate (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:315:9)',
        '    at handle (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:327:11)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:339:9',
        '    at next (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:328:7)',
        '    at Object.asyncIter (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:334:3)'
      ].join
    })).toEqual({
      message: 'template not found: layouts/main2.html',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      normalisedFilePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      processedBy: 'nunjucksMatcherA'
    })
  })
  it('should process a nunjucks error using a variable as a function', () => {
    expect(getErrorDetails(unixCwd, {
      message: [
        '(/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)',
        '  Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/node_modules/govuk-prototype-kit/lib/nunjucks/govuk-prototype-kit/includes/homepage-top.njk)',
        '  Error: Unable to call `serviceName`, which is not a function'
      ].join('\n'),
      stack: ['Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)',
        '  Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/node_modules/govuk-prototype-kit/lib/nunjucks/govuk-prototype-kit/includes/homepage-top.njk)',
        '  Error: Unable to call `serviceName`, which is not a function',
        '    at Object._prettifyError (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:36:11)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:563:19',
        '    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:148:12)',
        '    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:287:12)',
        '    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:57:12)',
        '    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:571:11',
        '    at Template.root [as rootRenderFunc] (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:22:3)',
        '    at Template.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:552:10)',
        '    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:56:10)',
        '    at fn (/Users/example.user/my-prototype/node_modules/a-sync-waterfall/index.js:26:24)'
      ].join('\n')
    })).toEqual({
      message: 'Unable to call `serviceName`, which is not a function',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      normalisedFilePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      processedBy: 'nunjucksMatcherA'
    })
  })
  it('should process a node console not function', () => {
    expect(getErrorDetails(unixCwd, {
      message: 'console is not a function',
      stack: [
        'TypeError: console is not a function',
        '    at Object.<anonymous> (/Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js:4:1)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)',
        '    at require (node:internal/modules/cjs/helpers:110:18)',
        '    at /Users/example.user/my-prototype/lib/utils/index.js:56:28',
        '    at Array.forEach (<anonymous>)',
        '    at Object.addNunjucksFilters (/Users/example.user/my-prototype/lib/utils/index.js:56:15)'
      ].join('\n')
    })).toEqual({
      message: 'console is not a function',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js',
      normalisedFilePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js',
      line: 4,
      column: 1,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it.skip('should process a node module not found', () => {
    expect(getErrorDetails(unixCwd, {
      message: [
        'Cannot find module \'govuk-prototype-kit2\'',
        'Require stack:',
        '- /Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js',
        '- /Users/example.user/my-prototype/lib/utils/index.js',
        '- /Users/example.user/my-prototype/server.js',
        '- /Users/example.user/my-prototype/listen-on-port.js'
      ].join('\n'),
      stack: [
        'Error: Cannot find module \'govuk-prototype-kit2\'',
        'Require stack:',
        '- /Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js',
        '- /Users/example.user/my-prototype/lib/utils/index.js',
        '- /Users/example.user/my-prototype/server.js',
        '- /Users/example.user/my-prototype/listen-on-port.js',
        '    at Module._resolveFilename (node:internal/modules/cjs/loader:1075:15)',
        '    at Module._load (node:internal/modules/cjs/loader:920:27)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)',
        '    at require (node:internal/modules/cjs/helpers:110:18)',
        '    at Object.<anonymous> (/Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js:1:27)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)'
      ].join('\n')
    })).toEqual({
      message: 'Cannot find module \'govuk-prototype-kit2\'',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js',
      normalisedFilePath: 'app/filters.js',
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'

    })
  })

  it('should process windows reference error', () => {
    expect(getErrorDetails(windowsCwd, {
      message: 'lksdf is not defined',
      stack: [
        'ReferenceError: lksdf is not defined',
        '    at Object.<anonymous> (X:\\Users\\example.user\\my-prototype\\app\\routes.js:11:1)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)',
        '    at require (node:internal/modules/cjs/helpers:110:18)',
        '    at Object.addRouters (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\utils\\index.js:76:5)',
        '    at Object.<anonymous> (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\server.js:137:7)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)'
      ].join('\n')
    })).toEqual({
      message: 'lksdf is not defined',
      filePath: 'X:\\Users\\example.user\\my-prototype\\app\\routes.js',
      normalisedFilePath: 'app\\routes.js',
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets',
      line: 11,
      column: 1
    })
  })

  it('should process nunjucks windows unexpected variable end error', () => {
    expect(getErrorDetails(windowsCwd, {
      message: '(X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk) [Line 13, Column 22]\n  expected variable end',
      stack: [
        'Template render error: (X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk) [Line 13, Column 22]',
        '  expected variable end',
        '    at Object._prettifyError (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:36:11)',
        '    at Template.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:538:21)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:366:27',
        '    at createTemplate (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:315:9)',
        '    at handle (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:327:11)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:339:9',
        '    at next (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:328:7)',
        '    at Object.asyncIter (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:334:3)',
        '    at Environment.getTemplate (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:321:9)',
        '    at Environment.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:360:10)'
      ].join('\n')
    })).toEqual({
      message: 'expected variable end',
      filePath: 'X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk',
      normalisedFilePath: 'app\\views\\index.njk',
      processedBy: 'nunjucksMatcherWithLineAndColumnSpelledOut',
      line: 13,
      column: 22
    })
  })

  it('should process nunjucks windows template render error', () => {
    expect(getErrorDetails(windowsCwd, {
      message: '(X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk)\n  Template render error: (X:\\Users\\example.user\\my-prototype\\node_modules\\govuk-prototype-kit\\lib\\nunjucks\\govuk-prototype-kit\\includes\\homepage-top.njk)\n  Error: Unable to call `serviceName`, which is not a function',
      stack: [
        'Template render error: (X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk)',
        '  Template render error: (X:\\Users\\example.user\\my-prototype\\node_modules\\govuk-prototype-kit\\lib\\nunjucks\\govuk-prototype-kit\\includes\\homepage-top.njk)',
        '  Error: Unable to call `serviceName`, which is not a function',
        '    at Object._prettifyError (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:36:11)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:563:19',
        '    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:148:12)',
        '    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:287:12)',
        '    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:57:12)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:571:11',
        '    at Template.root [as rootRenderFunc] (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:22:3)',
        '    at Template.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:552:10)',
        '    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:56:10)',
        '    at fn (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\a-sync-waterfall\\index.js:26:24)'
      ].join('\n')
    })).toEqual({
      message: 'Unable to call `serviceName`, which is not a function',
      filePath: 'X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk',
      normalisedFilePath: 'app\\views\\index.njk',
      processedBy: 'nunjucksMatcherA'
    })
  })

  it('should process nunjucks windows template not found error', () => {
    expect(getErrorDetails(windowsCwd, {
      message: '(X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk)\n  Error: template not found: layouts/main2.html',
      stack: [
        'Template render error: (X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk)',
        '  Error: template not found: layouts/main2.html',
        '    at Object._prettifyError (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:36:11)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:563:19',
        '    at Template.root [as rootRenderFunc] (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:37:3)',
        '    at Template.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:552:10)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:366:27',
        '    at createTemplate (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:315:9)',
        '    at handle (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:327:11)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:339:9',
        '    at next (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:328:7)',
        '    at Object.asyncIter (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:334:3)'
      ].join('\n')
    })).toEqual({
      message: 'template not found: layouts/main2.html',
      filePath: 'X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk',
      normalisedFilePath: 'app\\views\\index.njk',
      processedBy: 'nunjucksMatcherA'
    })
  })

  it('should process console not function error', () => {
    expect(getErrorDetails(windowsCwd, {
      message: 'console is not a function',
      stack: [
        'TypeError: console is not a function',
        '    at Object.<anonymous> (X:\\Users\\example.user\\my-prototype\\app\\filters.js:4:1)',
        '    at Module._compile (node:internal/modules/cjs/loader:1254:14)',
        '    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)',
        '    at Module.load (node:internal/modules/cjs/loader:1117:32)',
        '    at Module._load (node:internal/modules/cjs/loader:958:12)',
        '    at Module.require (node:internal/modules/cjs/loader:1141:19)',
        '    at require (node:internal/modules/cjs/helpers:110:18)',
        '    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\utils\\index.js:56:28',
        '    at Array.forEach (<anonymous>)',
        '    at Object.addNunjucksFilters (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\utils\\index.js:56:15)'
      ].join('\n')
    })).toEqual({
      message: 'console is not a function',
      filePath: 'X:\\Users\\example.user\\my-prototype\\app\\filters.js',
      normalisedFilePath: 'app\\filters.js',
      line: 4,
      column: 1,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it.skip('should process windows module not found error', () => {
    expect(getErrorDetails(unixCwd, {
      message: `
Cannot find module 'zgovuk-prototype-kit'
Require stack:
- /Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js
- /Users/example.user/my-prototype/lib/utils/index.js
- /Users/example.user/my-prototype/server.js
- /Users/example.user/my-prototype/listen-on-port.js`,
      stack: `Error: Cannot find module 'zgovuk-prototype-kit'
Require stack:\n- /home/ben/projects/prototype-kits/companion-prototype-kit/app/filters.js
- /Users/example.user/my-prototype/lib/utils/index.js
- /Users/example.user/my-prototype/server.js
- /Users/example.user/my-prototype/listen-on-port.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1039:15)
    at Module._load (node:internal/modules/cjs/loader:885:27)
    at Module.require (node:internal/modules/cjs/loader:1105:19)
    at require (node:internal/modules/cjs/helpers:103:18)
    at Object.<anonymous> (/home/ben/projects/prototype-kits/companion-prototype-kit/app/filters.js:1:27)
    at Module._compile (node:internal/modules/cjs/loader:1218:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1272:10)
    at Module.load (node:internal/modules/cjs/loader:1081:32)
    at Module._load (node:internal/modules/cjs/loader:922:12)
    at Module.require (node:internal/modules/cjs/loader:1105:19)`
    })).toEqual({
      message: 'Cannot find module \'zgovuk-prototype-kit\'',
      filePath: '/home/ben/projects/prototype-kits/companion-prototype-kit/app/filters.js',
      normalisedFilePath: 'app/filters.js',
      line: 1,
      processedBy: ''
    })
  })

  it.skip('should process windows module not found error', () => {
    const fileContents = `{
  "serviceName": "Service name goes here"
  "useNjkExtensions": true
}`
    const message = 'Unexpected string in JSON at position 46'
    const stack = `SyntaxError: X:\\Users\\example.user\\my-prototype\\app\\config.json: Unexpected string in JSON at position 46
    at JSON.parse (<anonymous>)
    at Object.readFileSync (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\jsonfile\\index.js:52:17)
    at getConfigFromFile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\config.js:22:18)
    at Object.getConfig (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\config.js:61:27)
    at Object.<anonymous> (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\listen-on-port.js:10:45)
    at Module._compile (node:internal/modules/cjs/loader:1218:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1272:10)
    at Module.load (node:internal/modules/cjs/loader:1081:32)
    at Module._load (node:internal/modules/cjs/loader:922:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)`

    expect(getErrorDetails(windowsCwd, { message, stack }, fileContents)).toEqual({
      message: 'Unexpected string in JSON',
      filePath: 'X:\\Users\\example.user\\my-prototype\\app\\config.json',
      normalisedFilePath: 'X:\\Users\\example.user\\my-prototype\\app\\config.json',
      line: 4,
      column: 1,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it.skip('should output a sensible default', () => {
    expect(getErrorDetails(unixCwd, {
      message: 'something',
      stack: ''
    })).toEqual({
      message: 'something',
      processedBy: 'fallback'
    })
  })
})
