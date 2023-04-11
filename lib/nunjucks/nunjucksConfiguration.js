import path from "path";
import nunjucks from "nunjucks";
import NunjucksLoader from "./nunjucksLoader.js";
import { startPerformanceTimer, endPerformanceTimer } from "../utils/performance.js";
const { stopWatchingNunjucks } = NunjucksLoader;
function getNunjucksAppEnv(appViews) {
    return new nunjucks.Environment(new NunjucksLoader(appViews));
}
function expressNunjucks(env, app) {
    function NunjucksView(name, opts) {
        this.name = name;
        this.path = name;
        this.defaultEngine = opts.defaultEngine;
        this.ext = path.extname(name);
        if (!this.ext && !this.defaultEngine) {
            throw new Error('No default engine was specified and no extension was provided.');
        }
    }
    NunjucksView.prototype.render = function render(opts, cb) {
        const timer = startPerformanceTimer();
        env.render(this.name, opts, function () {
            cb.apply(null, arguments);
            endPerformanceTimer('NunjucksView.render', timer);
        });
    };
    app.set('view', NunjucksView);
    app.set('nunjucksEnv', env);
    return env;
}
export { NunjucksLoader };
export { getNunjucksAppEnv };
export { expressNunjucks };
export { stopWatchingNunjucks };
export default {
    NunjucksLoader,
    getNunjucksAppEnv,
    expressNunjucks,
    stopWatchingNunjucks
};
