/* eslint-env jest */

const fs = require('fs').promises
const path = require('path')

jest.mock('./util')
const {
  getProjectVersion: mockGetProjectVersion,
  fetchOriginal: mockFetchOriginal
} = require('./util')
const { projectDir } = require('../path-utils')

const { mergeDeps, mergePackageJson, updatePackageJson } = require('./update-package-json')

describe('updatePackageJson', () => {
  let mockReadFile, mockWriteFile

  const originalPackageJson = `{
  "name": "govuk-prototype-kit",
  "dependencies": {
    "@govuk-prototype-kit/kit": "^1.0.0"
  }
}
`

  const userPackageJson = `{
  "name": "govuk-prototype-kit",
  "dependencies": {
    "@govuk-prototype-kit/kit": "^1.0.0",
    "foobar": "^1.0.0"
  }
}
`

  const newPackageJson = `{
  "name": "govuk-prototype-kit",
  "dependencies": {
    "@govuk-prototype-kit/kit": "^2.0.0"
  }
}
`

  const mergedPackageJson = `{
  "name": "govuk-prototype-kit",
  "dependencies": {
    "@govuk-prototype-kit/kit": "^2.0.0",
    "foobar": "^1.0.0"
  }
}
`

  beforeEach(() => {
    mockReadFile = jest.spyOn(fs, 'readFile').mockImplementation(() => {})
    mockWriteFile = jest.spyOn(fs, 'writeFile').mockImplementation(() => {})

    mockGetProjectVersion.mockResolvedValue('99.99.99')

    mockFetchOriginal.mockResolvedValue(originalPackageJson)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('changes package.json in the update folder to reflect changes user has made', async () => {
    // theirs
    mockReadFile.mockResolvedValueOnce(userPackageJson)
    // ours
    mockReadFile.mockResolvedValueOnce(newPackageJson)

    await updatePackageJson()

    expect(mockWriteFile).toHaveBeenCalledWith(
      path.join(projectDir, 'update', 'package.json'),
      mergedPackageJson,
      'utf8'
    )
  })

  it('does nothing if user has not changed package.json', async () => {
    // theirs
    mockReadFile.mockResolvedValueOnce(originalPackageJson)
    // ours
    mockReadFile.mockResolvedValueOnce(newPackageJson)

    await updatePackageJson()

    expect(mockWriteFile).not.toHaveBeenCalled()
  })
})

describe('mergePackageJson', () => {
  let theirs, original, ours

  beforeEach(() => {
    original = {
      version: '1.0.0',
      dependencies: {}
    }

    theirs = {
      version: '1.0.0',
      dependencies: {}
    }

    ours = {
      version: '1.0.0',
      dependencies: {}
    }
  })

  it('does a three way merge of a package.json object', () => {
    theirs = {
      version: '1.0.0',
      dependencies: {
        bar: '^1.0.0',
        foo: '^1.0.0'
      }
    }

    original = {
      version: '1.0.0',
      dependencies: {
        foo: '^1.0.0'
      }
    }

    ours = {
      version: '2.0.0',
      dependencies: {
        foo: '^2.0.0'
      }
    }

    expect(mergePackageJson(theirs, original, ours)).toEqual({
      version: '2.0.0',
      dependencies: {
        bar: '^1.0.0',
        foo: '^2.0.0'
      }
    })
  })

  it('updates the version number', () => {
    ours = {
      ...ours,
      version: '2.0.0'
    }

    expect(mergePackageJson(theirs, original, ours)).toEqual({
      version: '2.0.0',
      dependencies: {}
    })
  })

  it('removes properties that we have removed', () => {
    theirs = {
      ...theirs,
      devDependencies: {
        foobar: '^1.0.0'
      }
    }

    original = {
      ...original,
      devDependencies: {
        foobar: '^1.0.0'
      }
    }

    expect(mergePackageJson(theirs, original, ours)).toEqual({
      version: '1.0.0',
      dependencies: {}
    })
  })
})

describe('mergeDeps', () => {
  let theirs, original, ours

  beforeEach(() => {
    theirs = {
      foo: '^1.0.0'
    }
    original = {
      foo: '^1.0.0'
    }
    ours = {
      foo: '^1.0.0'
    }
  })

  it('does a three way merge of a dependencies object', () => {
    theirs = {
      bar: '^1.0.0',
      foo: '^1.0.0'
    }
    original = {
      foo: '^1.0.0'
    }
    ours = {
      foo: '^2.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      bar: '^1.0.0',
      foo: '^2.0.0'
    })
  })

  it('adds packages that we have added', () => {
    ours = {
      ...ours,
      bar: '^1.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      bar: '^1.0.0',
      foo: '^1.0.0'
    })
  })

  it('sorts the packages', () => {
    ours = {
      bar: '^1.0.0',
      ...ours
    }

    expect(Object.entries(mergeDeps(theirs, original, ours))).toEqual([
      ['bar', '^1.0.0'],
      ['foo', '^1.0.0']
    ])
  })

  it('sorts the packages in the same order as ours', () => {
    theirs = {
      ...theirs,
      'foo-bar': '^1.0.0',
      foo_baz: '^1.0.0'
    }
    original = {
      ...original,
      'foo-bar': '^1.0.0',
      foo_baz: '^1.0.0'
    }
    ours = {
      ...ours,
      foo_baz: '^1.0.0',
      'foo-bar': '^1.0.0'
    }

    expect(Object.entries(mergeDeps(theirs, original, ours))).toEqual([
      ['foo', '^1.0.0'],
      ['foo_baz', '^1.0.0'],
      ['foo-bar', '^1.0.0']
    ])
  })

  it('removes packages that we have removed', () => {
    theirs = {
      ...theirs,
      bar: '^1.0.0'
    }
    original = {
      ...original,
      bar: '^1.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      foo: '^1.0.0'
    })
  })

  it('removes packages that we have removed even if the user has updated them', () => {
    theirs = {
      ...theirs,
      bar: '^2.0.0'
    }
    original = {
      ...original,
      bar: '^1.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      foo: '^1.0.0'
    })
  })

  it('updates packages that we have updated', () => {
    ours = {
      ...ours,
      foo: '^2.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      foo: '^2.0.0'
    })
  })

  it('keeps packages the user has added', () => {
    theirs = {
      ...theirs,
      bar: '^1.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      bar: '^1.0.0',
      foo: '^1.0.0'
    })
  })

  it('does not upgrade a package version if the user has downgraded that package', () => {
    original = {
      ...original,
      bar: '^2.0.0'
    }
    theirs = {
      ...theirs,
      bar: '^1.0.0'
    }
    ours = {
      ...ours,
      bar: '^3.0.0',
      foo: '^2.0.0'
    }

    expect(mergeDeps(theirs, original, ours)).toEqual({
      bar: '^1.0.0',
      foo: '^2.0.0'
    })
  })
})
