'use strict';
// Node dependencies
let fs = require('fs');
let path = require('path');
// External dependencies
let parse = require('co-body');
// Internal dependencies
let handleError = require('../util/errors');
let consts = require('../util/consts');

// 'this' must be bound to app.data
// We don't abort execution if there are problems loading any given file, but spout
// warnings as appropriate.
module.exports = {
  loadFile: function(filename) {
    console.log('loading ' + filename);
    let contents = '';
    try {
      contents = fs.readFileSync(filename);
    } catch (e) {
      handleError(e, 'Problem reading cheatsheet file: ' + filename, true);
      return false;
    }
    let parsedContents = {};
    try {
      parsedContents = JSON.parse(contents);
    } catch (e) {
      handleError(e, 'Problem parsing JSON of cheatsheet file: ' + filename, true);
      return false;
    }
    if (parsedContents.head && parsedContents.head.aliases && parsedContents.head.title) {
      this.sheets[path.basename(filename)] = parsedContents;
      return true;
    } else {
      handleError(new SyntaxError('Cheatsheet file does not contain a valid header.') +
        'Aliases and title are required.', 'Ignored cheatsheet ' + filename + ' for processing.',
        true);
      return false;
    }
  },
  writeSheet: function*(next) {
    if (this.state.action !== consts.getAPIWriteSheet())
      return yield next;
    let sheet = yield parse(this);
    if (sheet.head && sheet.head.aliases[0]) {
      // Filenames are lower-case as no two sheets can have the same canonical alias
      let filename = this.app.config.pathToQueue + sheet.head.aliases[0].toLowerCase() + '.json';
      let writeOut = (fd) => {
        fs.write(fd, JSON.stringify(sheet, null, 2), (err) => {
          if (err)
            handleError(err, 'Problem writing to file descriptor for cheatsheet file.', true);
        });
      };
      fs.open(filename, 'wx', (err, fd) => {
        if (err) {
          filename += '_' + Date.now(); // for uniqueness
          fs.open(filename, 'wx', (err, fd) => {
            if (err) {
              handleError(err, 'Problem opening cheatsheet file: ' + filename, true);
            } else {
              writeOut(fd);
            }
          });
        } else {
          writeOut(fd);
        }
      });
      this.status = 200;
      this.body = 'Sheet successfully submitted.';
    } else {
      this.status = 400;
      this.body = 'Invalid sheet data (header or alias missing).';
    }
    return yield next;
  }
};
