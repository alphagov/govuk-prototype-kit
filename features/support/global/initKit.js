const cp = require('child_process')
const os = require('os')
const path = require('path')

let nextPort = 18888

function addInitialGitCommitToConfig (config) {
  console.log('addInitialGitCommitToConfig config', config)
  return new Promise((resolve, reject) => {
    cp.exec('git log --pretty="%H"', { cwd: config.directory }, (err, stdout, stderr) => {
      const result = (stdout || '').split(/[\n\r]+/)[0]
      if (result && result.trim()) {
        resolve({ ...config, initialCommit: result.trim() })
      } else {
        resolve({ ...config })
      }
    })
  })
}

function resetState (config) {
  console.log('resetState config', config)
  if (!config?.initialCommit) {
    throw new Error('It\'s not possible to reset the state as no innitial commit exists in the config.')
  }
  return new Promise(async (resolve, reject) => {
    cp.exec(`git reset --hard ${config.initialCommit} && rm -Rf .tmp && npm prune && npm install`, { cwd: config.directory })
  })
}

function initKit (config) {
  console.log('initKit config', config)
  if (config.directory) {
    return Promise.resolve({ startCommand: 'npm run dev', ...config })
  }
  const tmpDir = config.directory || path.join(os.tmpdir(), new Date().getTime() + '_' + ('' + Math.random()).split('.')[1])
  const rootDir = path.resolve(__dirname, '../../..')

  return new Promise((resolve, reject) => {
    let startCommand
    const initProcess = cp.spawn('./bin/cli', ['create', `--version=${rootDir}`, tmpDir], { cwd: rootDir })
    initProcess.stderr.on('data', (data) => console.warn('[stderr]', data.toString()))
    initProcess.stdout.on('data', (data) => {
      const str = data.toString()
      console.log(str)
      const [_, command] = str.split('To run your prototype:')
      if (command && command.trim()) {
        startCommand = command.trim()
      }
    })
    initProcess.on('error', (error) => {
      reject(error)
    })

    initProcess.on('close', code => {
      if (startCommand) {
        resolve({ ...config, startCommand, directory: tmpDir })
      } else {
        reject(new Error('initialisation failed'))
      }
    })
  })
}

function runKit (config) {
  let hasReturned = false
  console.log('runKit config', config)

  return new Promise((resolve, reject) => {
    const [command, ...args] = config.startCommand.split(' ')
    const kitProcess = cp.spawn(command, args, {
      cwd: config.directory,
      detached: true,
      env: {
        ...process.env,
        PORT: nextPort++,
        GPK_NO_STDIN: 'true'
      }
    })

    kitProcess.stderr.on('data', (data) => console.warn('[stderr]', data.toString()))
    kitProcess.stdout.on('data', (data) => {
      const str = data.toString()
      const regExpMatchArray = str.match(/(http:\/\/localhost:\d+)/)
      if (regExpMatchArray && regExpMatchArray[1]) {
        console.log('server address found', regExpMatchArray[1])
        if (hasReturned) {
          return
        }
        hasReturned = true
        resolve({
          ...config,
          serverAddress: regExpMatchArray[1].trim(),
          close: () => {
            kitProcess.stdin.pause()
            try {
              process.kill(-kitProcess.pid, 'SIGTERM')
            } catch (err) {
              console.error('error while stopping process')
              console.error(err)
            }
          }
        })
      }
    })
    kitProcess.on('error', (error) => {
      reject(error)
    })

    kitProcess.on('close', code => {
      reject(new Error('initialisation failed'))
    })
  })
}

module.exports = {
  startKit: (config = {}) => initKit(config)
    .then(addInitialGitCommitToConfig)
    .then(runKit),
  resetState
}
