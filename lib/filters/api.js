let environment
const whenEnvIsAvailable = []

const runWhenEnvIsAvailable = (fn) => {
  if (environment) {
    fn()
  } else {
    whenEnvIsAvailable.push(fn)
  }
}

const addFilterToEnvironment = (name, fn, config) => {
  let fnToAdd = fn
  if ((config || {}).renderAsHtml) {
    const safe = environment.getFilter('safe')
    fnToAdd = function () {
      return safe(fn.apply(null, arguments))
    }
  }
  environment.addFilter(name, fnToAdd)
}

const addGlobalToEnvironment = (name, value) => {
  environment.addGlobal(name, value)
}

const addFilter = (name, fn, config) => {
  runWhenEnvIsAvailable(() => {
    addFilterToEnvironment(name, fn, config)
  })
}

const addGlobal = (name, value) => {
  runWhenEnvIsAvailable(() => {
    addGlobalToEnvironment(name, value)
  })
}

const getFilter = (name) => {
  if (!environment) {
    console.warn(`Trying to get filter before the environment is set, couldn't retrieve filter [${name}]`)
  } else {
    try {
      return environment.getFilter(name)
    } catch (e) {
      if ((e.message || '').startsWith('filter not found: ')) {
        console.warn(`Couldn't retrieve filter [${name}]`)
      } else {
        throw e
      }
    }
  }
}

const setEnvironment = (env) => {
  environment = env
  while (whenEnvIsAvailable.length > 0) {
    const fn = whenEnvIsAvailable.shift()
    fn()
  }
}

module.exports = {
  external: {
    addFilter,
    getFilter,
    addGlobal
  },
  setEnvironment
}
