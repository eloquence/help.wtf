'use strict';
// External dependencies
let koa = require('koa'); // extremely lightweight framework for web apps
let gzip = require('koa-gzip');
let chokidar = require('chokidar'); // watch file changes
let app = koa();
// Internal dependencies
let db = require('./src/db');
let router = require('./src/router');
let render = require('./src/render');

app.config = {
  port: +process.argv[2] || 8000,
  baseUrl: 'http://localhost/',
  siteName: 'help.wtf',
  siteMotto: 'cheatsheets for life',
  pathToTemplates: __dirname + '/src/templates/',
  pathToQueue: __dirname + '/queue/',
  expose: function() { // Configuration that is exposed to client and templates
    return (
      { baseUrl: this.baseUrl,
        siteName: this.siteName,
        siteMotto: this.siteMotto }
      );
  }
};

app.data = {
  sheets: {},
  templates: {}
};

// Load data & monitor changes.
// We don't monitor removals in the off chance that we have stuff in memory
// that's lost on disk -- so to delete a sheet you have to restart the server
let watcher = chokidar.watch(__dirname + '/cheatsheets/*.json');

let loadIntoDb = db.loadFile.bind(app.data);
watcher.on('add', (filename) => {
  loadIntoDb(filename);
});
watcher.on('change', (filename) => {
  loadIntoDb(filename);
});

// We don't monitor templates since they change infrequently
render.loadTemplates(app.data, app.config.pathToTemplates);

/* ----- Begin middleware section ----- */
app.use(router.serveStatic); // Handle requests to /_static and serve files (gzip handled downstream)
app.use(router.exposeState); // Expose relevant state to client-side scripts
app.use(router.routeRoot);
app.use(router.routeComposer); // route GET requests for /_compose
app.use(router.routeSelectSheet); // route GET requests for sheets, including API and *.json source
app.use(router.routeWriteSheet); // route POST requests to create new sheets, API only
app.use(router.routePreviewSheet); // route POST requests to preview sheets, API only
app.use(render.renderDirectory);
app.use(render.renderComposer);
app.use(render.renderSheet);
app.use(db.writeSheet);
app.use(gzip());
/* ----- End middleware section ------ */
app.listen(app.config.port);

module.exports = app; // For testability
