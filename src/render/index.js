'use strict';
// Node dependencies
let fs = require('fs');
// External dependencies
let marked = require('marked'); // for markdown conversion
let hljs = require('highlight.js'); // for syntax highlighting
let ejs = require('ejs'); // for template parsing
let htmlUnescape = require('ent/decode'); // for escaping/unescaping HTML
let htmlEscape = require('ent/encode');
let parse = require('co-body'); // for asynchronous body-parsing using generators
// Internal dependencies
let handleError = require('../util/errors');
let consts = require('../util/consts.js');

// We don't allow in-line HTML, for now.
marked.setOptions({
  sanitize: true
});

// marked throws exceptions on some input. This helper function will fall back
// to the escaped input, so we still render output but don't allow in unsafe
/// content.
function safeMarked(text) {
  let rv = text;
  try {
    rv = marked(text);
    return rv;
  } catch(e) {
    return htmlEscape(rv);
  }
}

module.exports = {
  loadTemplates: function(dataObj, path) {
    let templates = [];
    try {
      templates = fs.readdirSync(path);
    } catch (e) {
      handleError(e, 'Problem reading directory containing templates: ' + path);
    }
    templates.forEach(loadFileIntoMemory);

    function loadFileIntoMemory(filename) {
      if (filename.slice(-4) !== '.ejs') return;
      let fullName = path + filename;
      let template = '';
      try {
        template = fs.readFileSync(fullName);
      } catch (e) {
        handleError(e, 'Problem reading template: ' + fullName);
      }
      template = template.toString('utf-8');
      try {
        dataObj.templates[filename] = ejs.compile(template, {
          filename: fullName
        });
      } catch (e) {
        handleError(e, 'Problem compiling template: ' + fullName);
      }
    }
  },
  renderDirectory: function*(next) {
    if (this.state.action === consts.getDirectory()) {
      let self = this;
      let makeUrl = (sheetName) =>
        self.app.config.baseUrl +
        encodeURIComponent(self.app.data.sheets[sheetName].head.aliases[0]);
      let makeLink = (sheetName, sheetTitle) =>
        '<a href="' +
        makeUrl(sheetName) +
        '">' +
        sheetTitle +
        '</a>';
      this.status = 200;
      this.body = this.app.data.templates['directory.ejs']({
        sheets: this.app.data.sheets,
        conf: this.app.config.expose(),
        makeLink: makeLink,
        makeUrl: makeUrl
      });
    }
    return yield next;
  },
  renderComposer: function*(next) {
    if (this.state.action === consts.getComposer()) {
      this.body = this.app.data.templates['composer.ejs']({
        conf: this.app.config.expose()
      });
    }
    return yield next;
  },
  // #TODO:10 Unwieldy, split into smaller functions
  renderSheet: function*(next) {
    if (this.state.action !== consts.getSheet() &&
      this.state.action !== consts.getAPIRenderSheet() &&
      this.state.action !== consts.getAPIPreviewSheet())
      return yield next;
    let isAPI = (this.state.action === consts.getAPIRenderSheet() ||
      this.state.action === consts.getAPIPreviewSheet());
    if (!this.state.activeSheet) {
      if (this.state.action === consts.getAPIPreviewSheet()) {
        let sheet = yield parse(this);
        if (sheet.head) {
          this.state.activeSheet = sheet;
          this.state.activeFilter = '';
        } else {
          this.status = 400;
          this.body = 'Could not parse submitted sheet - no valid header';
          return yield next;
        }
      } else {
        this.status = 404;
        this.body = 'wtf sheet not found';
        return yield next;
      }
    }
    this.status = 200;

    // Support for /sheet.json requests to get the source
    // (filters not supported)
    if (this.state.raw) {
      this.body = JSON.stringify(this.state.activeSheet, null, 2);
      this.type = 'application/json';
      return yield next;
    }

    let renderer = new marked.Renderer();
    let codeLang = this.state.activeSheet.head.highlight;
    let state = this.state;
    let renderCode = function(code, lang, pre) {
      lang = lang || codeLang;
      if (!pre) {
        // For codespans, marked has already escaped HTML entities at this stage.
        // (Irrespective of the sanitize option, it will apply some escaping.)
        // hljs will do the same. Neither provide an option to disable this
        // behavior. To avoid double-escaping, we unescape first.
        code = htmlUnescape(code);
      }
      code = lang ? hljs.highlight(lang, code).value : hljs.highlightAuto(code).value;
      code = '<code>' + code + '</code>';
      if (pre) code = '<pre class="codeblock">' + code + '</pre><input class="copyBtn" type="button" value="Copy">';
      return code;
    };
    let renderCodePre = function(code, lang) {
      return renderCode(code, lang, true);
    };

    renderer.codespan = renderCode;
    renderer.code = renderCodePre;

    marked.setOptions({
      renderer: renderer
    });

    let outputSections = [];
    let ids = [];
    let numRows = 0,
      totalRows = 0;
    for (let section of this.state.activeSheet.sections) {
      // Sections must have content or will be ignored
      if (!Array.isArray(section.content)) continue;
      let filter = this.state.activeFilter;
      let sectionObj = {};
      // If a filter is active, we suppress headlines
      if (!filter)
        sectionObj.title = section.title;
      sectionObj.rows = [];
      section.content.forEach((content) => {
        let id = content.title ? content.title.toLowerCase().replace(/ /g, '_').replace(/[^a-zA-Z0-9_?\-\(\)\.]/g, '') : '';
        if (!id || id == '_') id = '~';
        if (ids.indexOf(id) !== -1) {
          let incr = 1;
          do
            incr++;
          while (ids.indexOf(id + String(incr)) !== -1);
          id += String(incr);
        }
        ids.push(id);
        let isFiltered = filter ? true : false;
        if (isFiltered) {
          let matchOn = [];
          if (content.title) matchOn.push(content.title);
          if (content.description) matchOn.push(content.description);
          matchOn.forEach((subject) => {
            if (subject.toUpperCase().indexOf(filter.toUpperCase()) != -1)
              isFiltered = false;
          });
        }
        if (!isFiltered) {
          numRows++;
          codeLang = content.highlight ? content.highlight : state.activeSheet.head.highlight;
          sectionObj.rows.push({
            title: content.title ? safeMarked(content.title) : '',
            description: content.description ? safeMarked(content.description) : '',
            body: content.body ? safeMarked(content.body) : '',
            anchorId: id
          });
        }
        totalRows++;
      });
      outputSections.push(sectionObj);
    }
    let html = this.app.data.templates['sheet.ejs']({
      htmlSubtitle: ' ' + this.state.activeSheet.head.title,
      title: this.state.activeSheet.head.title,
      description: this.state.activeSheet.head.description,
      credits: this.state.activeSheet.head.credits,
      sections: outputSections,
      filter: this.state.activeFilter.toLowerCase(),
      numRows: numRows,
      totalRows: totalRows,
      multiColumn: this.state.activeSheet.head.multiColumn,
      conf: this.app.config.expose(),
      state: this.state.expose(),
      sheetPath: this.state.activeFilter ?
        this.path.substr(0, this.path.indexOf(':')) : this.path,
      contentOnly: isAPI
    });
    this.body = html;

    return yield next;
  }
};
