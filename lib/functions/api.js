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

  if (!name.includes('.')) {
    environment.addGlobal(name, fnToAdd)
  } else {
    const [key, ...rest] = name.split('.')
    try {
      environment.getGlobal(key)
    } catch (err) {
      environment.addGlobal(key, {})
    }
    rest.reduce((obj, next, index) => {
      if (index < rest.length - 1) {
        if (!obj[next]) {
          obj[next] = {}
        }
        return obj[next]
      }
      obj[next] = fnToAdd
      return null
    }, environment.getGlobal(key))
  }
}

function addFunction (name, fn, config) {
  runWhenEnvIsAvailable(() => {
    if (typeof fn === 'function') {
      addGlobalToEnvironment(name, fn, config)
    } else {
      console.warn(`Couldn't add function [${name}] as it is not a function`)
    }
  })
}

function getFunction (name) {
  if (!environment) {
    console.warn(`Trying to get a function before the environment is set, couldn't retrieve function [${name}]`)
  } else {
    try {
      return environment.getGlobal(name)
    } catch (e) {
      if ((e.message || '').startsWith('function not found: ')) {
        console.warn(`Couldn't retrieve function [${name}]`)
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
    addFunction,
    getFunction
  },
  setEnvironment
}
