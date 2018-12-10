import {danger, warn} from 'danger'

// No PR is too small to include a description of why you made a change
if (danger.github.pr.body.length < 10) {
  warn('Please include a description of your PR changes.')
}

// Check for a CHANGELOG entry
// const hasChangelog = danger.git.modified_files.some(f => f === 'CHANGELOG.md')
// const description = danger.github.pr.body + danger.github.pr.title
// const isTrivial = description.includes('#trivial')

// if (!hasChangelog && !isTrivial) {
//   warn('Please add a changelog entry for your changes.')
// }

// Request changes to lib also include changes to tests.
// const allFiles = danger.git.modified_files.concat(danger.git.created_files)
// const hasAppChanges = allFiles.some(p => includes(p, 'lib/'))
// const hasTestChanges = allFiles.some(p => includes(p, '__tests__/'))

// if (hasAppChanges && !hasTestChanges) {
//   warn('This PR does not include changes to tests, even though it affects app code.');
// }
