
// npm dependencies
const { spawn: crossSpawn } = require('cross-spawn')

function exec (command, options = {}, stdout) {
  const errorOutput = []
  const child = crossSpawn(command, [], { shell: true, ...options })

  if (child.stdout) {
    child.stdout.on('data', (data) => {
      if (stdout) {
        stdout(data)
      }
    })
  }
  if (child.stderr) {
    child.stderr.on('data', (data) => {
      errorOutput.push(data)
    })
  }

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        resolve(true)
      } else {
        const error = new Error(`Exit code was ${code}`)
        error.code = code
        if (errorOutput.length > 0) {
          error.errorOutput = errorOutput.join('\n')
        }
        reject(error)
      }
    })
  })
}

function spawn (command, args, options = {}) {
  const child = crossSpawn(command, args, { ...options })

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
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
