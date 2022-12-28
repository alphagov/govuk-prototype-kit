const { spawn: crossSpawn } = require('cross-spawn')
const colors = require('ansi-colors')

const exec = (command, options = {}, stdout) => {
  const errorOutput = []
  const child = crossSpawn(command, [], { shell: true, ...options })

  if (child.stdout) {
    child.stdout.on('data', function (data) {
      if (stdout) {
        stdout(data)
      }
    })
  }
  if (child.stderr) {
    child.stderr.on('data', function (data) {
      errorOutput.push(data)
    })
  }

  return new Promise(function (resolve, reject) {
    child.on('close', function (code) {
      if (code === 0) {
        resolve(true)
      } else {
        if (errorOutput.length > 0) {
          console.error(colors.red(errorOutput.join('\n')))
        }
        reject(new Error(`Exit code was ${code}`))
      }
    })
  })
}

const spawn = (command, args, options = {}) => {
  const child = crossSpawn(command, args, { ...options })

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

module.exports = {
  exec,
  spawn
}
