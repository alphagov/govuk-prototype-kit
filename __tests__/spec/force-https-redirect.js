import path from "path";
import request from "supertest";
import { mkdtempSync } from "../utils/index.js";
import app from "../../server.js";
import nunjucksLoader from "../../lib/nunjucks/nunjucksLoader.js";
const testDir = path.join(mkdtempSync(), 'force-https-redirect');
// Setup Environment Variables before setting App
// USE_HTTPS has no effect unless NODE_ENV=production
process.env.IS_INTEGRATION_TEST = 'true';
process.env.KIT_PROJECT_DIR = testDir;
process.env.NODE_ENV = 'production';
process.env.USE_HTTPS = 'true';
describe('The Prototype Kit - force HTTPS redirect functionality', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        nunjucksLoader.stopWatchingNunjucks();
    });
    describe('should in a production environment', () => {
        it('have HTTP header "location" field that begins with https', async () => {
            const response = await request(app).get('/');
            expect(response.header.location.startsWith('https://')).toBeTruthy();
        });
        it('redirect to the same HTTPS url', async () => {
            const response = await request(app).get('/');
            expect(response.header.location.endsWith('/')).toBeTruthy();
        });
        it('have HTTP header "status" field that indicates a redirect', async () => {
            const response = await request(app).get('/');
            expect(response.statusCode).toBe(302);
        });
    });
});
