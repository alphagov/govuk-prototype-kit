let environment;
const whenEnvIsAvailable = [];
function runWhenEnvIsAvailable(fn) {
    if (environment) {
        fn();
    }
    else {
        whenEnvIsAvailable.push(fn);
    }
}
function addFilterToEnvironment(name, fn, config) {
    let fnToAdd = fn;
    if ((config || {}).renderAsHtml) {
        const safe = environment.getFilter('safe');
        fnToAdd = function () {
            return safe(fn.apply(null, arguments));
        };
    }
    environment.addFilter(name, fnToAdd);
}
function addFilter(name, fn, config) {
    runWhenEnvIsAvailable(() => {
        addFilterToEnvironment(name, fn, config);
    });
}
function getFilter(name) {
    if (!environment) {
        console.warn(`Trying to get filter before the environment is set, couldn't retrieve filter [${name}]`);
    }
    else {
        try {
            return environment.getFilter(name);
        }
        catch (e) {
            if ((e.message || '').startsWith('filter not found: ')) {
                console.warn(`Couldn't retrieve filter [${name}]`);
            }
            else {
                throw e;
            }
        }
    }
}
function setEnvironment(env) {
    environment = env;
    while (whenEnvIsAvailable.length > 0) {
        const fn = whenEnvIsAvailable.shift();
        fn();
    }
}
export const external = {
    addFilter,
    getFilter
};
export { setEnvironment };
export default {
    external,
    setEnvironment
};
