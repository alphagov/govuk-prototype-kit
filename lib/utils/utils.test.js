import session from "express-session";
import sessionFileStore from "session-file-store";
import { sessionFileStoreQuietLogFn } from "./index.js";
/* eslint-env jest */
afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});
describe('sessionFileStoreQuietLogFn', () => {
    it('hides messages about deleting expired sessions', () => {
        jest.spyOn(global.console, 'log').mockImplementation();
        const SessionFileStore = sessionFileStore(session);
        jest.useFakeTimers({ doNotFake: ['performance'] });
        const testStore = new SessionFileStore({
            logFn: sessionFileStoreQuietLogFn,
            reapInterval: 0.01
        });
        jest.runOnlyPendingTimers();
        clearTimeout(testStore.options.reapIntervalObject);
        expect(console.log).not.toHaveBeenCalled();
    });
});
