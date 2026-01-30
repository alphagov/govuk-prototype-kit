// Mock the `package.json` file that will be `require`d by `build.js`
jest.mock('../package.json', () => ({}))

const sass = require('sass')
const { setPackagesCache } = require('./plugins/packages')
const { sassFunctions } = require('./build')

describe('build', () => {
  describe('sassFunctions', () => {
    describe('plugin-version-satisfies', () => {
      beforeAll(() => {
        setPackagesCache([
          {
            packageName: 'available-installed-plugin',
            installedVersion: '1.0.0',
            pluginConfig: {}
          }
        ])
      })

      it('accepts positional arguments', () => {
        const { css } = sass.compileString(
          `:root { 
            $result: plugin-version-satisfies(available-installed-plugin, '>=1.0.0');
            value: #{$result};
          }`,
          {
            functions: sassFunctions
          }
        )

        expect(css).toContain('value: true')
      })

      it('accepts keyword arguments', () => {
        const { css } = sass.compileString(
          `:root { 
            $result: plugin-version-satisfies(
              $plugin-name: available-installed-plugin, 
              $semver-range: '>=1.0.0'
            );
            value: #{$result}; 
          }`,
          {
            functions: sassFunctions
          }
        )

        expect(css).toContain('value: true')
      })

      it('accepts mixed arguments', () => {
        const { css } = sass.compileString(
          `:root { 
            $result: plugin-version-satisfies(
              available-installed-plugin, 
              $semver-range: '>=1.0.0'
            );
            value: #{$result}; 
          }`,
          {
            functions: sassFunctions
          }
        )

        expect(css).toContain('value: true')
      })
    })
  })
})
