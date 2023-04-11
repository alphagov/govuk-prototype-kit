import nunjucks from "nunjucks";
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
function addGlobalToEnvironment(name, fn, config) {
    let fnToAdd = fn;
    if ((config || {}).renderAsHtml) {
        fnToAdd = function () {
            const html = fn.apply(null, arguments);
            return new nunjucks.runtime.SafeString(html);
        };
    }
    environment.addGlobal(name, fnToAdd);
}
function addFunction(name, fn, config) {
    runWhenEnvIsAvailable(() => {
        if (typeof fn === 'function') {
            addGlobalToEnvironment(name, fn, config);
        }
        else {
            console.warn(`Couldn't add function [${name}] as it is not a function`);
        }
    });
}
function getFunction(name) {
    if (!environment) {
        console.warn(`Trying to get a function before the environment is set, couldn't retrieve function [${name}]`);
    }
    else {
        try {
            return environment.getGlobal(name);
        }
        catch (e) {
            if ((e.message || '').startsWith('function not found: ')) {
                console.warn(`Couldn't retrieve function [${name}]`);
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
    addFunction,
    getFunction
};
export { setEnvironment };
export default {
    external,
    setEnvironment
};
