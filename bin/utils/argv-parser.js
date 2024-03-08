/**
 *
 * @param {NodeJS.Process["argv"]} argvInput
 * @param {{ booleans?: string[] }} config
 */
function parse (argvInput, config = {}) {
  const args = [...argvInput].splice(2)
  const options = /** @type {Object<string, string | boolean>} */ ({})
  const paths = /** @type {string[]} */ ([])
  const booleanOptions = config.booleans || []

  /** @type {string | undefined} */
  let command

  /** @type {{ option: string } | undefined} */
  let contextFromPrevious

  /**
   * @param {string} unprocessed
   */
  const processOptionName = (unprocessed) => {
    if (unprocessed.startsWith('--')) {
      return unprocessed.substring(2)
    }
    if (unprocessed.startsWith('-')) {
      return unprocessed.substring(1)
    }
  }

  /**
   * @param {string} arg
   */
  const prepareArg = (arg) => {
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith('\'') && arg.endsWith('\''))) {
      return arg.substring(1, arg.length - 1)
    }
    return arg
  }

  args.forEach(arg => {
    if (arg === '--') {
      return
    }
    if (arg.startsWith('-')) {
      const processedArgName = processOptionName(arg)
      if (booleanOptions.includes(processedArgName)) {
        options[processedArgName] = true
        return
      }
      if (arg.includes('=')) {
        const parts = arg.split('=')
        options[processOptionName(parts[0])] = prepareArg(parts[1])
        return
      }
      contextFromPrevious = {
        option: arg
      }
      return
    }
    if (contextFromPrevious && contextFromPrevious.option) {
      options[processOptionName(contextFromPrevious.option)] = arg
      contextFromPrevious = undefined
      return
    }
    if (command) {
      paths.push(arg)
    } else {
      command = arg
    }
  })

  return {
    command,
    options,
    paths
  }
}

module.exports = {
  parse
}

/**
 * @typedef {ReturnType<typeof parse>} ArgvParsed
 */
