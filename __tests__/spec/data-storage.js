/* eslint-env jest */
const request = require('supertest')
const app = require('../../server.js')
const path = require('path')
const fs = require('fs')
const utils = require('../../lib/utils.js')

jest.setTimeout(30000)

function readFile (pathFromRoot) {
  return fs.readFileSync(path.join(__dirname, '../../' + pathFromRoot), 'utf8')
}
/**
 *
 */
describe('The data storage', () => {
  // check session-data defaults file exists

  it.skip('file should exist', (done) => {
    const sessionDataDefaultsFile = readFile('app/data/session-data-defaults.js')

    request(app)
      .get(sessionDataDefaultsFile)
      .expect('Content-Type', /application\/javascript; charset=UTF-8/)
      // .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err)
        } else {
          done()
        }
      })
  })

  describe('storeData function', () => {
    it('should add input data into session data', async () => {
      let initialSessionData = {
        'driver-name': 'Dr Emmett Brown'
      }

      const inputData = {
        'vehicle-registration': 'OUTATIME'
      }

      utils.storeData(inputData, initialSessionData)

      expect(initialSessionData).toEqual({
        'driver-name': 'Dr Emmett Brown',
        'vehicle-registration': 'OUTATIME'
      })
    })

    it('should merge object into object', async () => {
      let initialSessionData = {
        vehicle: {
          'driver-name': 'Dr Emmett Brown'
        }
      }

      const inputData = {
        vehicle: {
          registration: 'OUTATIME'
        }
      }

      utils.storeData(inputData, initialSessionData)

      expect(initialSessionData).toEqual({
        vehicle: {
          'driver-name': 'Dr Emmett Brown',
          registration: 'OUTATIME'
        }
      })
    })
  })
})
