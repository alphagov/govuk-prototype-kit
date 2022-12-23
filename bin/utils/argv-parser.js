module.exports = {
  parse: (argvInput) => {
    const args = [...argvInput].splice(2)
    const options = {}
    const paths = []
    let command
    let contextFromPrevious

    const processOptionName = (unprocessed) => {
      if (unprocessed.startsWith('--')) {
        return unprocessed.substring(2)
      }
      if (unprocessed.startsWith('-')) {
        return unprocessed.substring(1)
      }
    }

    args.forEach(arg => {
      if (arg.startsWith('-')) {
        if (arg.includes('=')) {
          const parts = arg.split('=')
          options[processOptionName(parts[0])] = parts[1]
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
}
