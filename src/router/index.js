'use strict';
// External dependencies
let send = require('koa-send'); // for static files

// Internal dependencies
let consts = require('../util/consts.js');

module.exports = {
  serveStatic: function*(next) {
    if (this.path.slice(0, 8) === '/_static') {
      this.state.action = consts.getStatic();
      let file = this.path.slice(8);
      // ms, cache static resources for up to 5 minutes in production
      let maxage = process.env.NODE_ENV === 'production' ? 300000 : 0;
      yield send(this, file, {
        maxage,
        root: __dirname + '/../../_static'
      });
      return;
    }
    return yield next;
  },
  exposeState: function*(next) {
    this.state.expose = function() {
      return ({
        sheet: this.activeSheet ? this.activeSheet.head.aliases[0] : null
      });
    };
    return yield next;
  },
  routeRoot: function*(next) {
    if (this.path === '/' && this.method == 'GET')
      this.state.action = consts.getDirectory();
    return yield next;
  },
  routeComposer: function*(next) {
    if (this.path === '/_compose' && this.method == 'GET')
      this.state.action = consts.getComposer();
    return yield next;
  },
  routeSelectSheet: function*(next) {
    if (this.method !== 'GET' || this.state.action === consts.getStatic())
      return yield next;

    let isAPI = false;

    // Path processing for sheets

    // Detect API calls
    let sheetPath = decodeURIComponent(this.path);
    if (sheetPath.substr(0, 11) === '/_api/sheet') {
      isAPI = true;
      sheetPath = sheetPath.slice(11);
    }
    // Support raw queries
    if (sheetPath.substr(sheetPath.length - 5) == '.json') {
      sheetPath = sheetPath.slice(0, sheetPath.length - 5);
      this.state.raw = true;
    }
    // Extract filter component
    this.state.activeFilter = '';
    let searchPos = sheetPath.indexOf(':');
    if (searchPos != -1) {
      this.state.activeFilter = sheetPath.substr(searchPos + 1);
      sheetPath = sheetPath.substr(0, searchPos);
    }

    for (let sheetName in this.app.data.sheets) {

      // Abort if we're done
      if (this.state.activeSheet) break;

      let sheet = this.app.data.sheets[sheetName];

      // Sheet headers are enforced by the DB layer, so no undef checks required.
      for (let alias of sheet.head.aliases) {

        if (alias.slice(0, 1) == '_') {
          console.warn('Warning: Alias ' + alias + ' ignored, underscore prefix is reserved for internal use.');
          continue;
        }
        if (alias.indexOf(':') != -1) {
          console.warn('Warning: Alias ' + alias + ' ignored, : is a reserved character for searches.');
        }

        // Leading slash is optional for aliases
        if (alias.slice(0, 1) != '/') alias = '/' + alias;

        // Each alias is a valid route, e.g.
        // '/es6' will take us to the ES6 sheets.
        if (sheetPath.toLowerCase() == alias.toLowerCase()) {
          this.state.activeSheet = sheet;
          this.state.action = isAPI ? consts.getAPIRenderSheet() :
            consts.getSheet();
        }
      }
    }
    return yield next;
  },
  routePreviewSheet: function*(next) {
    if (this.method !== 'POST' || this.path.substr(0, 13) !== '/_api/preview')
      return yield next;
    this.state.action = consts.getAPIPreviewSheet();
    return yield next;
  },
  routeWriteSheet: function*(next) {
    if (this.method !== 'POST' || this.path.substr(0, 11) !== '/_api/sheet')
      return yield next;
    this.state.action = consts.getAPIWriteSheet();
    return yield next;
  }
};
