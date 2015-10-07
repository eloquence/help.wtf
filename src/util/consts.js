'use strict';
const SERVE_STATIC = Symbol('Serve action: serving static file');
const RENDER_DIRECTORY = Symbol('Render action: the directory of all sheets');
const RENDER_SHEET = Symbol('Render action: an individual sheet');
const RENDER_COMPOSER = Symbol('Render action: the sheet composer');
const API_WRITE_SHEET = Symbol('API action: write a sheet');
const API_RENDER_SHEET = Symbol('API action: render an existing sheet');
const API_PREVIEW_SHEET = Symbol('API action: preview sheet POSTed to API');

// We use methods, not properties, so an exception is thrown in case of typos,
// and to prevent accidental manipulation
module.exports = Object.freeze({
  getStatic: () => SERVE_STATIC,
  getDirectory: () => RENDER_DIRECTORY,
  getSheet: () => RENDER_SHEET,
  getComposer: () => RENDER_COMPOSER,
  getAPIWriteSheet: () => API_WRITE_SHEET,
  getAPIRenderSheet: () => API_RENDER_SHEET,
  getAPIPreviewSheet: () => API_PREVIEW_SHEET
});
