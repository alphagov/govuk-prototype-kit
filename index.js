
// local dependencies
const filtersApi = require('./lib/filters/api').external
const globalsApi = require('./lib/globals/api').external
const routesApi = require('./lib/routes/api').external

module.exports = {
  requests: routesApi,
  views: { ...filtersApi, ...globalsApi }
}
