import api from "./api.js";
describe('Filters', () => {
    afterEach(() => {
        api.setEnvironment(undefined);
        jest.clearAllMocks();
    });
    it('Should add filters to the environment', () => {
        const env = { addFilter: jest.fn() };
        const fn = () => { };
        api.setEnvironment(env);
        api.external.addFilter('my-great-filter', fn);
        expect(env.addFilter).toHaveBeenCalledWith('my-great-filter', fn);
    });
    it('Should add filters to the environment', () => {
        const fn = () => { };
        const env = { getFilter: jest.fn().mockReturnValue(fn) };
        api.setEnvironment(env);
        expect(api.external.getFilter('my-great-filter')).toBe(fn);
    });
    it('Should log a warning when trying to get a filter before the environment is set', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        api.external.getFilter('my-great-filter');
        expect(console.warn).toHaveBeenCalledWith('Trying to get filter before the environment is set, couldn\'t retrieve filter [my-great-filter]');
    });
    it('Should log a warning when trying to get a filter that doesn\'t exist', () => {
        const env = {
            getFilter: (name) => {
                throw new Error('filter not found: ' + name);
            }
        };
        api.setEnvironment(env);
        api.external.getFilter('my-great-filter');
        expect(console.warn).toHaveBeenCalledWith('Couldn\'t retrieve filter [my-great-filter]');
    });
    it('Should re-throw errors other than "filter not found".', () => {
        const error = new Error('Some other error');
        error.code = 'ERR';
        const env = {
            getFilter: (name) => {
                throw error;
            }
        };
        api.setEnvironment(env);
        expect(() => {
            api.external.getFilter('my-great-filter');
        }).toThrow(error);
    });
    it('Should allow adding filters before setting environment', () => {
        const env = { addFilter: jest.fn() };
        const fn = () => { };
        api.external.addFilter('my-great-filter', fn);
        api.setEnvironment(env);
        expect(env.addFilter).toHaveBeenCalledWith('my-great-filter', fn);
    });
    it('Should add filters in the right order when environment is set', () => {
        const namesInOrder = [];
        const env = { addFilter: jest.fn((name, fn) => { namesInOrder.push(name); }) };
        api.external.addFilter('my-great-filter', () => { });
        api.external.addFilter('someone-elses-filter', () => { });
        api.external.addFilter('a-third-filter', () => { });
        api.setEnvironment(env);
        expect(namesInOrder).toEqual(['my-great-filter', 'someone-elses-filter', 'a-third-filter']);
    });
    it('should use the core "safe" function to render as html both before and after environment is set', () => {
        const expected = (number) => `__SAFE_START__ __FILTER${number}_START__ CONTENT __FILTER${number}_END__ __SAFE_END__`;
        const fakeSafe = jest.fn(input => `__SAFE_START__ ${input} __SAFE_END__`);
        const addedFilters = {
            safe: fakeSafe
        };
        const env = {
            getFilter: jest.fn(filterName => {
                const foundFilter = addedFilters[filterName];
                if (foundFilter) {
                    return foundFilter;
                }
                throw new Error(`filter not found: ${filterName}`);
            }),
            addFilter: jest.fn((filterName, fn) => {
                addedFilters[filterName] = fn;
            })
        };
        api.external.addFilter('myHtmlFilter1', (content) => `__FILTER1_START__ ${content} __FILTER1_END__`, { renderAsHtml: true });
        api.setEnvironment(env);
        api.external.addFilter('myHtmlFilter2', (content) => `__FILTER2_START__ ${content} __FILTER2_END__`, { renderAsHtml: true });
        expect(api.external.getFilter('myHtmlFilter1')('CONTENT')).toBe(expected(1));
        expect(api.external.getFilter('myHtmlFilter2')('CONTENT')).toBe(expected(2));
    });
});
