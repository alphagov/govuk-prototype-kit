/* eslint-env jest */

// local dependencies
const parser = require('./argv-parser')
const { getKitInstallDependency } = require('./index')

const addStandardArgs = arr => [
  '/Users/user.name/.nvm/versions/node/node.version/bin/node',
  '/Users/user.name/.nvm/versions/node/node.version/bin/govuk-prototype-kit',
  ...arr
]

describe('argv parser', () => {
  it('should parse a basic command', () => {
    const result = parser.parse(addStandardArgs(['hello']))

    expect(result).toEqual({
      command: 'hello',
      options: {},
      paths: []
    })
  })
  it('should parse a different basic command', () => {
    const result = parser.parse(addStandardArgs(['goodbye']))

    expect(result).toEqual({
      command: 'goodbye',
      options: {},
      paths: []
    })
  })
  it('should parse an option with double-hyphen', () => {
    const result = parser.parse(addStandardArgs([
      '--name',
      'Alex',
      'hello'
    ]))

    expect(result).toEqual({
      command: 'hello',
      options: {
        name: 'Alex'
      },
      paths: []
    })
  })
  it('should handle multiple parameters with double-hyphens', () => {
    const result = parser.parse(addStandardArgs([
      '--name',
      'Alex',
      '--pronouns',
      'they/them',
      'hello'
    ]))

    expect(result).toEqual({
      command: 'hello',
      options: {
        name: 'Alex',
        pronouns: 'they/them'
      },
      paths: []
    })
  })
  it('should handle paths after the command', () => {
    const result = parser.parse(addStandardArgs([
      'create',
      '/tmp/abc'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {},
      paths: ['/tmp/abc']
    })
  })
  it('should support the longest command we currently have', () => {
    const result = parser.parse(addStandardArgs([
      '--version',
      'local',
      'create',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: 'local'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support options between the command and path(s)', () => {
    const result = parser.parse(addStandardArgs([
      'create',
      '--version',
      'local',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: 'local'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support single-hyphen options', () => {
    const result = parser.parse(addStandardArgs([
      'create',
      '-v',
      'local',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        v: 'local'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support options after path(s)', () => {
    const result = parser.parse(addStandardArgs([
      'create',
      '/tmp/hello-world',
      '--version',
      'local'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: 'local'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support semver numbers as values', () => {
    const result = parser.parse(addStandardArgs([
      '--version',
      '13.0.1',
      'create',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: '13.0.1'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support equals to set an option', () => {
    const result = parser.parse(addStandardArgs([
      '--version=local',
      'create',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: 'local'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support speech marks when using equals to set an option', () => {
    const result = parser.parse(addStandardArgs([
      '--version="this is a multi-word option"',
      'create',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: 'this is a multi-word option'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should support quote marks when using equals to set an option', () => {
    const result = parser.parse(addStandardArgs([
      '--version=\'this is a multi-word option\'',
      'create',
      '/tmp/hello-world'
    ]))

    expect(result).toEqual({
      command: 'create',
      options: {
        version: 'this is a multi-word option'
      },
      paths: ['/tmp/hello-world']
    })
  })
  it('should allow a boolean option', () => {
    const result = parser.parse(addStandardArgs([
      'create',
      '--no-version-control',
      '/tmp/hello-world'
    ]), {
      booleans: ['no-version-control']
    })

    expect(result).toEqual({
      command: 'create',
      options: {
        'no-version-control': true
      },
      paths: ['/tmp/hello-world']
    })
  })
})

describe('kit install dependency', () => {
  it('uses the package name directly when it has not been renamed', () => {
    expect(getKitInstallDependency('govuk-prototype-kit')).toBe('govuk-prototype-kit')
  })

  it('installs renamed packages under the govuk-prototype-kit alias', () => {
    expect(getKitInstallDependency('@dwp/govuk-prototype-kit')).toBe('govuk-prototype-kit@npm:@dwp/govuk-prototype-kit')
  })

  it('installs renamed semver versions under the govuk-prototype-kit alias', () => {
    expect(getKitInstallDependency('@dwp/govuk-prototype-kit', '13.20.1')).toBe('govuk-prototype-kit@npm:@dwp/govuk-prototype-kit@13.20.1')
  })

  it('passes through local installs for development', () => {
    expect(getKitInstallDependency('@dwp/govuk-prototype-kit', 'local')).toBe('local')
    expect(getKitInstallDependency('@dwp/govuk-prototype-kit', 'local-symlink')).toBe('local-symlink')
  })

  it('passes through explicit dependency specs', () => {
    const dependencySpec = 'git+ssh://git@gitlab.example/dwp/govuk-prototype-kit.git'
    expect(getKitInstallDependency('@dwp/govuk-prototype-kit', dependencySpec)).toBe(dependencySpec)
  })
})
