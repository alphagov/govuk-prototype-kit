const { exec, spawn } = require('child_process')
const colors = require('ansi-colors')

module.exports = {
  exec: (command, options, stdout) => {
    const errorOutput = []
    const optionsProcessed = Object.assign({}, options || {})

    optionsProcessed.env = optionsProcessed.env || {}
    optionsProcessed.env.LANG = optionsProcessed.env.LANG || process.env.LANG
    optionsProcessed.env.PATH = optionsProcessed.env.PATH || process.env.PATH

    const child = exec(command, optionsProcessed)

    child.stdout.on('data', function (data) {
      if (stdout) {
        stdout(data)
      }
    })
    child.stderr.on('data', function (data) {
      errorOutput.push(data)
    })

    return new Promise(function (resolve, reject) {
      child.on('close', function (code) {
        if (code === 0) {
          resolve(true)
        } else {
          console.error(colors.red(errorOutput.join('\n')))
          reject(new Error(`Exit code was ${code}`))
        }
      })
    })
  },
  spawn: (command, args, options) => {
    const optionsProcessed = Object.assign({}, options || {})

    optionsProcessed.env = optionsProcessed.env || {}
    optionsProcessed.env.LANG = optionsProcessed.env.LANG || process.env.LANG
    optionsProcessed.env.PATH = optionsProcessed.env.PATH || process.env.PATH

    const child = spawn(command, args, optionsProcessed)

    return new Promise(function (resolve, reject) {
      child.on('close', function (code) {
        if (code === 0) {
          resolve(true)
        } else {
          reject(new Error(`Exit code was ${code}`))
        }
      })
    })
  }
}
