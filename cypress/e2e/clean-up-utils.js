class CleanUpUtils {
  #restoreStack = []
  #task

  constructor (task) {
    this.#task = task
  }

  get isEmpty () {
    return !this.#restoreStack.length
  }

  addRestoreFunction (fn) {
    this.#restoreStack.push(fn)
  }

  replaceTextInFile ({ filename, originalText, newText }) {
    this.#task('replaceTextInFile', { filename, originalText, newText })
    this.addRestoreFunction(() => {
      this.#task('replaceTextInFile', { filename, newText: originalText, originalText: newText })
    })
  }

  restore () {
    while (!this.isEmpty) {
      const currentRestoreFn = this.#restoreStack.pop()
      try {
        currentRestoreFn()
      } catch (error) {
        console.error({ error })
        break
      }
    }
  }

  restoreToStarter () {
    this.#task('restoreToStarter')
  }
}

module.exports = CleanUpUtils
