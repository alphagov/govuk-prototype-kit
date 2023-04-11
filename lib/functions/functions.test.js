import api from "./api.js";
describe('Functions', () => {
    afterEach(() => {
        api.setEnvironment(undefined);
        jest.clearAllMocks();
    });
    it('Should add functions to the environment', () => {
        const env = { addGlobal: jest.fn() };
        const fn = () => { };
        api.setEnvironment(env);
        api.external.addFunction('my-great-function', fn);
        expect(env.addGlobal).toHaveBeenCalledWith('my-great-function', fn);
    });
    it('Should add functions to the environment', () => {
        const fn = () => { };
        const env = { getGlobal: jest.fn().mockReturnValue(fn) };
        api.setEnvironment(env);
        expect(api.external.getFunction('my-great-function')).toBe(fn);
    });
    it('Should log a warning when trying to get a function before the environment is set', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        api.external.getFunction('my-great-function');
        expect(console.warn).toHaveBeenCalledWith('Trying to get a function before the environment is set, couldn\'t retrieve function [my-great-function]');
    });
    it('Should log a warning when trying to get a function that doesn\'t exist', () => {
        const env = {
            getGlobal: (name) => {
                throw new Error('function not found: ' + name);
            }
        };
        api.setEnvironment(env);
        api.external.getFunction('my-great-function');
        expect(console.warn).toHaveBeenCalledWith('Couldn\'t retrieve function [my-great-function]');
    });
    it('Should re-throw errors other than "function not found".', () => {
        const error = new Error('Some other error');
        error.code = 'ERR';
        const env = {
            getGlobal: () => {
                throw error;
            }
        };
        api.setEnvironment(env);
        expect(() => {
            api.external.getFunction('my-great-function');
        }).toThrow(error);
    });
    it('Should allow adding functions before setting environment', () => {
        const env = { addGlobal: jest.fn() };
        const fn = () => { };
        api.external.addFunction('my-great-function', fn);
        api.setEnvironment(env);
        expect(env.addGlobal).toHaveBeenCalledWith('my-great-function', fn);
    });
    it('Should add functions in the right order when environment is set', () => {
        const namesInOrder = [];
        const env = { addGlobal: jest.fn((name) => { namesInOrder.push(name); }) };
        api.external.addFunction('my-great-function', () => { });
        api.external.addFunction('someone-elses-function', () => { });
        api.external.addFunction('a-third-function', () => { });
        api.setEnvironment(env);
        expect(namesInOrder).toEqual(['my-great-function', 'someone-elses-function', 'a-third-function']);
    });
});
