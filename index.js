import { external } from "./lib/filters/api.js";
import { external as external$0 } from "./lib/functions/api.js";
import { external as external$1 } from "./lib/routes/api.js";
// local dependencies
const filtersApi = { external }.external;
const functionsApi = { external: external$0 }.external;
const routesApi = { external: external$1 }.external;
export const views = { ...filtersApi, ...functionsApi };
export { routesApi as requests };
export default {
    requests: routesApi,
    views
};
