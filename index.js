const viewsApi = require('./lib/views/api').external
const routesApi = require('./lib/routes/api').external

module.exports = {
  requests: routesApi,
  views: viewsApi
}
