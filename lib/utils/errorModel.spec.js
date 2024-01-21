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
      errorStack: `Error: Example error
    at Object.<anonymous> (/Users/example.user/my-prototype/playground.js:5:9)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:23:47`,
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
      errorStack: `ReferenceError: lksdf is not defined
    at Object.<anonymous> (/Users/example.user/prototype-kits/companion-prototype-kit/app/routes.js:11:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Module.require (node:internal/modules/cjs/loader:1141:19)
    at require (node:internal/modules/cjs/helpers:110:18)
    at Object.addRouters (/Users/example.user/my-prototype/lib/utils/index.js:76:5)
    at Object.<anonymous> (/Users/example.user/my-prototype/server.js:137:7)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)`,
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
      errorStack: `/Users/example.user/my-prototype/index.js:11



SyntaxError: Unexpected end of input
    at internalCompileFunction (node:internal/vm:73:18)
    at wrapSafe (node:internal/modules/cjs/loader:1176:20)
    at Module._compile (node:internal/modules/cjs/loader:1218:27)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Module.require (node:internal/modules/cjs/loader:1141:19)
    at require (node:internal/modules/cjs/helpers:110:18)
    at Object.<anonymous> (/Users/example.user/my-prototype/lib/filters/core-filters.js:3:34)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)`,
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
      errorStack: `Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk) [Line 13, Column 22]
  expected variable end
    at Object._prettifyError (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:36:11)
    at Template.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:538:21)
    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:366:27
    at createTemplate (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:315:9)
    at handle (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:327:11)
    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:339:9
    at next (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:328:7)
    at Object.asyncIter (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:334:3)
    at Environment.getTemplate (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:321:9)
    at Environment.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:360:10)`,
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
      ].join()
    })).toEqual({
      message: 'template not found: layouts/main2.html',
      filePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      normalisedFilePath: '/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk',
      errorStack: 'Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk),  Error: template not found: layouts/main2.html,    at Object._prettifyError (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:36:11),    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:563:19,    at Template.root [as rootRenderFunc] (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:37:3),    at Template.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:552:10),    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:366:27,    at createTemplate (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:315:9),    at handle (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:327:11),    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:339:9,    at next (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:328:7),    at Object.asyncIter (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:334:3)',
      processedBy: 'nunjucksMatch'
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
      errorStack: `Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/app/views/index.njk)
  Template render error: (/Users/example.user/prototype-kits/companion-prototype-kit/node_modules/govuk-prototype-kit/lib/nunjucks/govuk-prototype-kit/includes/homepage-top.njk)
  Error: Unable to call \`serviceName\`, which is not a function
    at Object._prettifyError (/Users/example.user/my-prototype/node_modules/nunjucks/src/lib.js:36:11)
    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:563:19
    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:148:12)
    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:287:12)
    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:57:12)
    at /Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:571:11
    at Template.root [as rootRenderFunc] (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:22:3)
    at Template.render (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:552:10)
    at eval (eval at _compile (/Users/example.user/my-prototype/node_modules/nunjucks/src/environment.js:633:18), <anonymous>:56:10)
    at fn (/Users/example.user/my-prototype/node_modules/a-sync-waterfall/index.js:26:24)`,
      processedBy: 'nunjucksMatch'
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
      errorStack: `TypeError: console is not a function
    at Object.<anonymous> (/Users/example.user/prototype-kits/companion-prototype-kit/app/filters.js:4:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Module.require (node:internal/modules/cjs/loader:1141:19)
    at require (node:internal/modules/cjs/helpers:110:18)
    at /Users/example.user/my-prototype/lib/utils/index.js:56:28
    at Array.forEach (<anonymous>)
    at Object.addNunjucksFilters (/Users/example.user/my-prototype/lib/utils/index.js:56:15)`,
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
      errorStack: `ReferenceError: lksdf is not defined
    at Object.<anonymous> (X:\\Users\\example.user\\my-prototype\\app\\routes.js:11:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Module.require (node:internal/modules/cjs/loader:1141:19)
    at require (node:internal/modules/cjs/helpers:110:18)
    at Object.addRouters (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\utils\\index.js:76:5)
    at Object.<anonymous> (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\server.js:137:7)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)`,
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
      line: 13,
      column: 22,
      errorStack: `Template render error: (X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk) [Line 13, Column 22]
  expected variable end
    at Object._prettifyError (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:36:11)
    at Template.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:538:21)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:366:27
    at createTemplate (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:315:9)
    at handle (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:327:11)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:339:9
    at next (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:328:7)
    at Object.asyncIter (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:334:3)
    at Environment.getTemplate (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:321:9)
    at Environment.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:360:10)`,
      processedBy: 'nunjucksMatcherWithLineAndColumnSpelledOut'
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
      errorStack: `Template render error: (X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk)
  Template render error: (X:\\Users\\example.user\\my-prototype\\node_modules\\govuk-prototype-kit\\lib\\nunjucks\\govuk-prototype-kit\\includes\\homepage-top.njk)
  Error: Unable to call \`serviceName\`, which is not a function
    at Object._prettifyError (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:36:11)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:563:19
    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:148:12)
    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:287:12)
    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:57:12)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:571:11
    at Template.root [as rootRenderFunc] (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:22:3)
    at Template.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:552:10)
    at eval (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:56:10)
    at fn (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\a-sync-waterfall\\index.js:26:24)`,
      processedBy: 'nunjucksMatch'
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
      errorStack: `Template render error: (X:\\Users\\example.user\\my-prototype\\app\\views\\index.njk)
  Error: template not found: layouts/main2.html
    at Object._prettifyError (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:36:11)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:563:19
    at Template.root [as rootRenderFunc] (eval at _compile (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:633:18), <anonymous>:37:3)
    at Template.render (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:552:10)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:366:27
    at createTemplate (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:315:9)
    at handle (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:327:11)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\environment.js:339:9
    at next (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:328:7)
    at Object.asyncIter (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\node_modules\\nunjucks\\src\\lib.js:334:3)`,
      processedBy: 'nunjucksMatch'
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
      errorStack: `TypeError: console is not a function
    at Object.<anonymous> (X:\\Users\\example.user\\my-prototype\\app\\filters.js:4:1)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Module._load (node:internal/modules/cjs/loader:958:12)
    at Module.require (node:internal/modules/cjs/loader:1141:19)
    at require (node:internal/modules/cjs/helpers:110:18)
    at X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\utils\\index.js:56:28
    at Array.forEach (<anonymous>)
    at Object.addNunjucksFilters (X:\\Users\\example.user\\opensource\\alphagov\\govuk-prototype-kit\\lib\\utils\\index.js:56:15)`,
      processedBy: 'nodeMatchWithLineAndColumnColonSeperatedInBrackets'
    })
  })

  it('should process a sass syntax error', () => {
    expect(getErrorDetails(unixCwd, {
      message: `expected "{".
[34m  ╷[0m
[34m1 │[0m sdfsf[31m[0m
[34m  │[0m [31m     ^[0m
[34m  ╵[0m
  app/assets/sass/cheese.scss 1:6  root stylesheet`,
      stack: `Error: expected "{".
[34m  ╷[0m
[34m1 │[0m sdfsf[31m[0m
[34m  │[0m [31m     ^[0m
[34m  ╵[0m
  app/assets/sass/cheese.scss 1:6  root stylesheet
    at Object.wrapException (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:1247:17)
    at SpanScanner.error$3$length$position (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:67896:15)
    at SpanScanner.expectChar$2$name (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:67978:12)
    at SpanScanner.expectChar$1 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:67981:19)
    at ScssParser0.children$1 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:91335:10)
    at ScssParser0._stylesheet0$_withChildren$1$3 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:97629:39)
    at ScssParser0._stylesheet0$_withChildren$3 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:97634:19)
    at ScssParser0._stylesheet0$_styleRule$2 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:94688:20)
    at ScssParser0._stylesheet0$_variableDeclarationOrStyleRule$0 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:94539:22)
    at ScssParser0._stylesheet0$_statement$1$root (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:94462:215)`
    })).toEqual({
      message: 'expected "{".',
      filePath: 'app/assets/sass/cheese.scss',
      normalisedFilePath: 'app/assets/sass/cheese.scss',
      line: 1,
      column: 6,
      errorStack: `Error: expected "{".
  ╷
1 │ sdfsf
  │      ^
  ╵
  app/assets/sass/cheese.scss 1:6  root stylesheet
    at Object.wrapException (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:1247:17)
    at SpanScanner.error$3$length$position (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:67896:15)
    at SpanScanner.expectChar$2$name (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:67978:12)
    at SpanScanner.expectChar$1 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:67981:19)
    at ScssParser0.children$1 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:91335:10)
    at ScssParser0._stylesheet0$_withChildren$1$3 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:97629:39)
    at ScssParser0._stylesheet0$_withChildren$3 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:97634:19)
    at ScssParser0._stylesheet0$_styleRule$2 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:94688:20)
    at ScssParser0._stylesheet0$_variableDeclarationOrStyleRule$0 (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:94539:22)
    at ScssParser0._stylesheet0$_statement$1$root (/home/ben/WebstormProjects/govuk-prototype-kit/node_modules/sass/sass.dart.js:94462:215)`,
      processedBy: 'sassMatcher'
    })
  })
})
