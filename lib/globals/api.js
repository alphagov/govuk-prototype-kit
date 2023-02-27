// npm dependencies
const nunjucks = require('nunjucks')

let environment
const whenEnvIsAvailable = []

function runWhenEnvIsAvailable (fn) {
  if (environment) {
    fn()
  } else {
    whenEnvIsAvailable.push(fn)
  }
}

function addGlobalToEnvironment (name, fn, config) {
  let fnToAdd = fn
  if ((config || {}).renderAsHtml) {
    fnToAdd = function () {
      const html = fn.apply(null, arguments)
      return new nunjucks.runtime.SafeString(html)
    }
  }
  environment.addGlobal(name, fnToAdd)
}

function addGlobal (name, fn, config) {
  runWhenEnvIsAvailable(() => {
    addGlobalToEnvironment(name, fn, config)
  })
}

function getGlobal (name) {
  if (!environment) {
    console.warn(`Trying to get global before the environment is set, couldn't retrieve global [${name}]`)
  } else {
    try {
      return environment.getGlobal(name)
    } catch (e) {
      if ((e.message || '').startsWith('global not found: ')) {
        console.warn(`Couldn't retrieve global [${name}]`)
      } else {
        throw e
      }
    }
  }
}

function setEnvironment (env) {
  environment = env
  while (whenEnvIsAvailable.length > 0) {
    const fn = whenEnvIsAvailable.shift()
    fn()
  }
}

module.exports = {
  external: {
    addGlobal,
    getGlobal
  },
  setEnvironment
}
