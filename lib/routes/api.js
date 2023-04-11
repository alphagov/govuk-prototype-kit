import express from "express";
let expressApp;
const routersBeforeAppWasSet = [];
function configureAppToUseRouter(path, router) {
    if (expressApp) {
        expressApp.use(path, router);
    }
    else {
        routersBeforeAppWasSet.push({ router, path });
    }
}
function setupRouter(path = '/') {
    if (typeof path !== 'string' && path !== undefined) {
        const errorMessage = 'setupRouter cannot be provided with a router,' +
            ' it sets up a router and returns it to you.';
        throw new Error(errorMessage);
    }
    const router = express.Router();
    configureAppToUseRouter(path, router);
    return router;
}
function serveDirectory(urlPath, directoryPath) {
    configureAppToUseRouter(urlPath, express.static(directoryPath));
}
function setApp(app) {
    expressApp = app;
    routersBeforeAppWasSet.forEach(config => {
        configureAppToUseRouter(config.path, config.router);
    });
}
function resetState() {
    expressApp = undefined;
    routersBeforeAppWasSet.splice(0, routersBeforeAppWasSet.length);
}
export const external = {
    setupRouter,
    serveDirectory
};
export { setApp };
export { resetState };
export default {
    external,
    setApp,
    resetState
};
