let environment
const filtersToAddToEnv = []

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

const addFilter = (name, fn, config) => {
  if (environment) {
    addFilterToEnvironment(name, fn, config)
  } else {
    filtersToAddToEnv.push({ name, fn, config })
  }
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
  while (filtersToAddToEnv.length > 0) {
    const { name, fn, config } = filtersToAddToEnv.shift()
    addFilterToEnvironment(name, fn, config)
  }
}
module.exports = {
  external: {
    addFilter,
    getFilter
  },
  setEnvironment
}
