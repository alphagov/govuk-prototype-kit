const Filestore = require("./session-file-store");
const fse = require ("fs-extra")

jest.mock('fs-extra', () => {
    return {
      ensureDirSync: jest.fn().mockResolvedValue(true),
      writeJsonSync: jest.fn().mockResolvedValue(true),
      readJsonSync: jest.fn().mockResolvedValue('{ sessionId: 1500, data: { name: "Jon" }')
    }
})
let store;

describe('session-file-store', () => {
    beforeEach(() => {
        store = new Filestore();
      })
    
    afterEach(() => {

    })

    it('canWriteSessionToFile', () => {
        dataToWrite = { sessionId: 1500, data: { name: "Jon" }}
        cb = jest.fn()
        store.set(dataToWrite.sessionId, dataToWrite, cb)

        expect(fse.ensureDirSync).toHaveBeenCalledTimes(1)  
        expect(fse.writeJsonSync).toHaveBeenCalledTimes(1)  
    })

    it('canWriteSessionToFile', () => {
        sessionToRead = { sessionId: 1500 }
        cb = jest.fn()
        res = store.get(sessionToRead.sessionId, cb)

        expect(fse.readJsonSync).toHaveBeenCalledTimes(1)  
        // excpect(res).toEqual('{ sessionId: 1500, data: { name: "Jon" }')
    })
})