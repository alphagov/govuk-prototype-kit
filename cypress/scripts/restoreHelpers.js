const { spawn: crossSpawn } = require('cross-spawn')

const exec = (command, dir) => new Promise((resolve) => {
  crossSpawn(command, { shell: true, cwd: dir }).on('close', (code) => {
    resolve(code)
  })
})

async function updateLastKnownVersions (projectDir) {
  await exec('git commit -am "Update"', projectDir)
}

async function restoreToLastKnownVersion (projectDir) {
  await exec('git add -A . && git reset --hard HEAD && npm prune && npm install', projectDir)
}

module.exports = {
  updateLastKnownVersions,
  restoreToLastKnownVersion
}
