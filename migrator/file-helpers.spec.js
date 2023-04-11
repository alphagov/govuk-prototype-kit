import path from "path";
import util from "util";
import { projectDir } from "../lib/utils/paths.js";
import { getFileAsLines, removeLineFromFile, replaceStartOfFile, deleteFile, deleteDirectory } from "./file-helpers.js";
import { mockFileSystem } from "../__tests__/utils/mock-file-system.js";
// local dependencies
jest.mock('./logger');
describe('file helpers', () => {
    const joinLines = arr => arr.join('\n');
    const writeFileToMockFile = (filePathParts, contentStringOrArray) => testScope.fileSystem
        .writeFile(filePathParts, typeof contentStringOrArray === 'string' ? contentStringOrArray : joinLines(contentStringOrArray));
    let testScope;
    beforeEach(() => {
        testScope = {
            fileSystem: mockFileSystem(projectDir)
        };
        testScope.fileSystem.setupSpies();
    });
    afterEach(() => {
        testScope.fileSystem.teardown();
    });
    describe('get file as lines', () => {
        it('should retrieve a file contents in an array of lines', async () => {
            const filePathParts = ['VERSION.txt'];
            const filePath = writeFileToMockFile(filePathParts, ['8.1.2']);
            const lines = await getFileAsLines(filePath);
            expect(lines).toEqual(['8.1.2']);
        });
    });
    describe('replace before line', () => {
        it('should replace before and including an exact match on a single line', async () => {
            const lineToFind = '// Add your routes here - above the module.exports line';
            const userCode = joinLines([
                '',
                'something added by the user',
                'also on multiple lines'
            ]);
            const replacement = joinLines([
                'some new code',
                'on multiple lines'
            ]);
            const filePath = writeFileToMockFile(['app', 'routes.js'], [
                'something old',
                'something else old',
                lineToFind,
                userCode
            ]);
            const resultPromise = replaceStartOfFile({
                filePath,
                lineToFind,
                replacement
            });
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true);
            expect(testScope.fileSystem.readFile(['app', 'routes.js'])).toBe(joinLines([
                replacement,
                userCode
            ]));
        });
        it('should leave non-matching files alone', async () => {
            const originalContents = ['completely custom code', 'on', 'multiple', 'lines'];
            const filePath = writeFileToMockFile(['app', 'routes.js'], originalContents);
            const resultPromise = replaceStartOfFile({
                filePath,
                lineToFind: 'this line does not exist in the file',
                replacement: 'this should not appear because the line didn\'t match'
            });
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(false);
            expect(testScope.fileSystem.readFile(['app', 'routes.js'])).toBe(joinLines(originalContents));
        });
    });
    describe('remove line', () => {
        it('should remove a repeated line from a file', async () => {
            const lineToRemove = 'module.exports = router';
            const filePathParts = ['app', 'routes.js'];
            const filePath = writeFileToMockFile(filePathParts, [
                'const router = "hello world"',
                lineToRemove,
                'const router2 = "hello mars"',
                `${lineToRemove}2`,
                lineToRemove,
                `${lineToRemove} // this is the one that actually does something`
            ]);
            const resultPromise = removeLineFromFile({
                filePath,
                lineToRemove
            });
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true);
            expect(testScope.fileSystem.readFile(filePathParts)).toBe(joinLines([
                'const router = "hello world"',
                'const router2 = "hello mars"',
                `${lineToRemove}2`,
                `${lineToRemove} // this is the one that actually does something`
            ]));
        });
        it('should remove multiple distinct lines from a file', async () => {
            const lineToRemove = 'module.exports = router';
            const lineToRemove2 = `${lineToRemove}2`;
            const lineToRemove3 = 'const router2 = "hello mars"';
            const filePathParts = ['app', 'routes.js'];
            const filePath = writeFileToMockFile(filePathParts, [
                'const router = "hello world"',
                lineToRemove,
                lineToRemove3,
                lineToRemove2,
                lineToRemove,
                `${lineToRemove} // this is the one that actually does something`
            ]);
            const resultPromise = removeLineFromFile({
                filePath,
                lineToRemove: [
                    lineToRemove,
                    lineToRemove2,
                    lineToRemove3
                ]
            });
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true);
            expect(testScope.fileSystem.readFile(filePathParts)).toBe(joinLines([
                'const router = "hello world"',
                `${lineToRemove} // this is the one that actually does something`
            ]));
        });
        it('should leave file alone when no matches', async () => {
            const filePathParts = ['app', 'routes.js'];
            const originalContents = [
                'const router = "hello world"',
                'module.exports = router',
                'const router2 = "hello mars"',
                'module.exports = router2',
                'module.exports = router',
                'module.exports = router // this is the one that actually does something'
            ];
            const filePath = writeFileToMockFile(filePathParts, originalContents);
            const resultPromise = removeLineFromFile({
                filePath,
                lineToRemove: 'this line does not exist'
            });
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(false);
            expect(testScope.fileSystem.readFile(filePathParts)).toBe(joinLines(originalContents));
        });
    });
    describe('delete file', () => {
        it('delete file', async () => {
            const filePathParts = ['app', 'views', 'layout_unbranded.html'];
            const filePath = writeFileToMockFile(filePathParts, 'hello');
            const resultPromise = deleteFile(filePath);
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true);
            expect(testScope.fileSystem.doesFileExist(filePathParts)).toBe(false);
        });
    });
    describe('delete file', () => {
        it('delete file that exists', async () => {
            const filePathParts = ['app', 'views', 'layout_unbranded.html'];
            const filePath = writeFileToMockFile(filePathParts, 'hello');
            expect(testScope.fileSystem.doesFileExist(filePathParts)).toBe(true);
            const resultPromise = deleteFile(filePath);
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true); // because the result is that no file exists in that location
            expect(testScope.fileSystem.doesFileExist(filePathParts)).toBe(false);
        });
        it('treat deleting a non-existant file as a success', async () => {
            const filePathParts = ['app', 'views', 'layout_unbranded.html'];
            const nonexistentFilePath = ['some', 'other', 'file'];
            writeFileToMockFile(filePathParts, 'hello');
            expect(testScope.fileSystem.doesFileExist(nonexistentFilePath)).toBe(false);
            const resultPromise = deleteFile(path.join(projectDir, ...nonexistentFilePath));
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true); // because the result is that no file exists in that location
            expect(testScope.fileSystem.doesFileExist(filePathParts)).toBe(true);
        });
    });
    describe('delete directory', () => {
        it('delete directory that exists', async () => {
            const directoryPathParts = ['app', 'views'];
            const directoryPath = testScope.fileSystem.createDirectory(directoryPathParts);
            expect(testScope.fileSystem.doesDirectoryExist(directoryPathParts)).toBe(true);
            const resultPromise = deleteDirectory(directoryPath);
            expect(util.types.isPromise(resultPromise)).toBe(true);
            const result = await resultPromise;
            expect(result).toBe(true); // because the result is that no file exists in that location
            expect(testScope.fileSystem.doesDirectoryExist(directoryPathParts)).toBe(false);
        });
    });
});
