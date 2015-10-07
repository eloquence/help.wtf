// Limited FF polyfill for focusin/focusout from https://gist.github.com/nuxodin/9250e56a3ce6c0446efa
// Cf. https://bugzilla.mozilla.org/show_bug.cgi?id=687787
(function(){
  'use strict';
    var w = window,
        d = w.document;

    if( w.onfocusin === undefined ){
        d.addEventListener('focus'    ,addPolyfill    ,true);
        d.addEventListener('blur'     ,addPolyfill    ,true);
        d.addEventListener('focusin'  ,removePolyfill ,true);
        d.addEventListener('focusout' ,removePolyfill ,true);
    }
    function addPolyfill(e){
        var type = e.type === 'focus' ? 'focusin' : 'focusout';
        var event = new CustomEvent(type, { bubbles:true, cancelable:false });
        event.c1Generated = true;
        e.target.dispatchEvent( event );
    }
    function removePolyfill(e){
        if(!e.c1Generated){
            d.removeEventListener('focus'    ,addPolyfill    ,true);
            d.removeEventListener('blur'     ,addPolyfill    ,true);
            d.removeEventListener('focusin'  ,removePolyfill ,true);
            d.removeEventListener('focusout' ,removePolyfill ,true);
        }
        setTimeout(function(){
            d.removeEventListener('focusin'  ,removePolyfill ,true);
            d.removeEventListener('focusout' ,removePolyfill ,true);
        });
    }
})();
(function() {
  'use strict';
  var editorElement = document.getElementById('editor');
  var markdownHint = 'Accepts <a href="' + conf.baseUrl + 'md' + '" target="_new">markdown</a>';
  var langs = [
    '1c',
    'actionscript',
    'apache',
    'applescript',
    'armasm',
    'xml',
    'asciidoc',
    'aspectj',
    'autohotkey',
    'avrasm',
    'axapta',
    'bash',
    'brainfuck',
    'cal',
    'capnproto',
    'ceylon',
    'clojure',
    'clojure-repl',
    'cmake',
    'coffeescript',
    'cpp',
    'cs',
    'css',
    'd',
    'markdown',
    'dart',
    'delphi',
    'diff',
    'django',
    'dns',
    'dockerfile',
    'dos',
    'dust',
    'elixir',
    'ruby',
    'erb',
    'erlang-repl',
    'erlang',
    'fix',
    'fortran',
    'fsharp',
    'gcode',
    'gherkin',
    'glsl',
    'go',
    'gradle',
    'groovy',
    'haml',
    'handlebars',
    'haskell',
    'haxe',
    'http',
    'inform7',
    'ini',
    'java',
    'javascript',
    'json',
    'julia',
    'kotlin',
    'lasso',
    'less',
    'lisp',
    'livecodeserver',
    'livescript',
    'lua',
    'makefile',
    'mathematica',
    'matlab',
    'mel',
    'mercury',
    'mizar',
    'monkey',
    'nginx',
    'nimrod',
    'nix',
    'nsis',
    'objectivec',
    'ocaml',
    'openscad',
    'oxygene',
    'parser3',
    'perl',
    'pf',
    'php',
    'powershell',
    'processing',
    'profile',
    'prolog',
    'protobuf',
    'puppet',
    'python',
    'q',
    'r',
    'rib',
    'roboconf',
    'rsl',
    'ruleslanguage',
    'rust',
    'scala',
    'scheme',
    'scilab',
    'scss',
    'smali',
    'smalltalk',
    'sml',
    'sql',
    'stata',
    'step21',
    'stylus',
    'swift',
    'tcl',
    'tex',
    'thrift',
    'tp',
    'twig',
    'typescript',
    'vala',
    'vbnet',
    'vbscript',
    'vbscript-html',
    'verilog',
    'vhdl',
    'vim',
    'x86asm',
    'xl'
  ];
  var editor = new JSONEditor(editorElement, {
    theme: 'bootstrap3',
    disable_properties: true,
    disable_edit_json: true,
    disable_collapse: true,
    show_errors: "never",
    schema: {
      type: "object",
      options: {
        disable_edit_json: false,
      },
      title: "Cheatsheet",
      properties: {
        head: {
          title: "Header",
          type: "object",
          properties: {
            title: {
              title: "Title *",
              type: "string",
              minLength: 1,
              description: "Shown as part of the page title, and as a headline"
            },
            description: {
              title: "Description",
              type: "string",
              description: "Shown as subtitle and in search results"
            },
            multiColumn: {
              title: "Multi-column layout (40 characters per column)",
              description: "Good for compact sheets",
              type: "boolean",
              format: "checkbox",
              default: false
            },
            aliases: {
              title: "Aliases *",
              type: "array",
              format: "table",
              description: "help.wtf/alias will point to your cheatsheet; first alias is canonical. Aliases are not case-sensitive (help.wtf/alias, help.wtf/AlIaS, etc. will work).",
              minItems: 1,
              items: {
                type: "string",
                title: "Alias",
                minLength: 1
              }
            },
            credits: {
              title: "Credits",
              type: "array",
              minItems: 1,
              format: "table",
              description: "Author credits",
              items: {
                type: "object",
                properties: {
                  name: {
                    title: "Full name or pseudonym",
                    type: "string"
                  },
                  email: {
                    title: "Email address",
                    type: "string",
                    format: "email",
                    description: "Only distributed in source"
                  },
                  url: {
                    title: "Credit URL",
                    type: "string",
                    format: "url"
                  }
                }
              }
            },
            highlight: {
              title: "Source code format",
              description: "Default for syntax highlighting",
              type: "string",
              default: "javascript",
              enum: langs
            }
          }
        },
        sections: {
          type: "array",
          format: "tabs",
          title: "Sections",
          description: "Cheatsheet content is divided into sections and rows",
          minItems: 1,
          items: {
            type: "object",
            title: "Section",
            properties: {
              title: {
                type: "string",
                title: "Section title *",
                minLength: 1
              },
              content: {
                type: "array",
                title: "Contents",
                minItems: 1,
                items: {
                  type: "object",
                  title: "Row",
                  options: {
                    disable_properties: false,
                  },
                  properties: {
                    title: {
                      title: "Title",
                      description: markdownHint,
                      type: "string"
                    },
                    description: {
                      title: "Description",
                      description: markdownHint,
                      type: "string"
                    },
                    body: {
                      title: "Body",
                      description: markdownHint,
                      type: "string",
                      format: "textarea"
                    },
                    highlight: {
                      title: "Source code format",
                      description: "Syntax highlighting to use for this row",
                      type: "string",
                      enum: langs,
                      default: "javascript"
                    }
                  },
                  defaultProperties: ["title", "description", "body"]
                }
              }
            }
          }
        }
      }
    }
  });
  var submitButton = document.getElementById('submitButton');
  var downloadButton = document.getElementById('downloadButton');
  var previewButton = document.getElementById('previewButton');
  var downloadLink = document.getElementById('downloadLink');
  var licenseCheckbox = document.getElementById('licenseCheckbox');
  var licenseWarning = document.getElementById('licenseWarning');
  var successMessage = document.getElementById('successMessage');
  var failureMessage = document.getElementById('failureMessage');
  var previewBanner = document.getElementById('previewBanner');
  var backToEditor = document.getElementById('backToEditor');
  var preview = document.getElementById('preview');

  // Recover from local storage
  // #TODO:0 Turn into init function
  var editJSON = document.getElementsByClassName('json-editor-btn-edit')[0];
  var recoverButtonHelp = 'Load contents of editor from last preview';
  var recoverButtonDisabled = 'No previous save state found';

  if (window.localStorage) {
    var recoverButton = document.createElement('button');
    recoverButton.innerHTML = 'Recover from last preview';
    recoverButton.className = 'btn btn-default';
    editJSON.parentElement.insertBefore(recoverButton, editJSON);
    recoverButton.addEventListener('click', function() {
      var lastPreview;
      try {
        lastPreview = localStorage.getItem('lastPreview');
      } catch(e) {
        return false;
      }
      if (lastPreview !== null)
        editor.setValue(JSON.parse(lastPreview));
    });
    if (localStorage.getItem('lastPreview') === null) {
        recoverButton.disabled = true;
        recoverButton.title = recoverButtonDisabled;
    } else
      recoverButton.title = recoverButtonHelp;
  }

  // We track scroll positions of edtor & preview separately. It's not perfect,
  // but better than forcing the user to scroll.
  var editorPos = 0;
  var previewPos = 0;
  var previousElement = document.body;
  var lastVal = JSON.stringify(editor.getValue());

  window.editor = editor; // global for debugging

  // Track scroll position for nice preview back & forth switching
  document.body.addEventListener('focusout', function(event) {
    if (event.target != previewButton) {
      editorPos = document.documentElement.scrollTop || document.body.scrollTop;
      previousElement = event.target;
    }
  });

  licenseCheckbox.addEventListener('change', function() {
    if (licenseCheckbox.checked)
      licenseWarning.style.display = 'none';
  });

  // Check if all required fields have been filled in
  var allGood = function() {
    // Show validation messages
    editor.setOption('show_errors', 'change');
    editor.onChange();

    if (editor.validation_results.length) {
      // Scroll to first error.
      // The editor uses a rAF, so we have to queue our function up with it
      // to avoid race conditions. A rAF-polyfill is part of the editor.
      window.requestAnimationFrame(function() {
        var errorElements = document.getElementsByClassName('has-error');
        if (errorElements.length)
          errorElements[0].scrollIntoView(true);
      });
      return false;
    } else
      return true;
  };

  downloadButton.addEventListener('click', function() {
    if (allGood()) {
      // Trigger browser download
      var exportData = 'data:application/json;charset=utf-8,';
      var json = encodeURIComponent(JSON.stringify(editor.getValue(), null, 2));
      downloadLink.href = exportData + json;
      downloadLink.download = (editor.getValue().head.aliases[0] || "cheatsheet") + ".json";
      return true;
    } else {
      downloadLink.href = '#';
      return false;
    }
  });

  var getPreview = function() {
    var sheet = editor.getValue();
    var sheetData = JSON.stringify(sheet);
    if (window.localStorage) {
      try {
        localStorage.setItem('lastPreview', sheetData);
        recoverButton.disabled = false;
        recoverButton.title = recoverButtonHelp;
      } catch(e) {
        // Unsupported or storage full
      }
    }
    var url = conf.baseUrl + '_api/preview';
    var req = new XMLHttpRequest();
    var processResponse = function() {
      if (this.status == 200) {
        editorElement.style.display = 'none';
        preview.innerHTML = this.responseText;
        previewBanner.style.display = 'inline';
        preview.style.display = 'inline';
        previewButton.innerHTML = 'Back to editor (<U>P</U>)';
        previewButton.removeEventListener('click', getPreview);
        previewButton.addEventListener('click', restoreEditor);
        document.documentElement.scrollTop = document.body.scrollTop = previewPos;
      }
    };
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.addEventListener('load', processResponse);
    req.send(sheetData);
  };

  var restoreEditor = function() {
    previewPos = document.documentElement.scrollTop || document.body.scrollTop;
    preview.style.display = 'none';
    previewBanner.style.display = 'none';
    editorElement.style.display = 'inline';
    previewButton.innerHTML = '<u>P</U>review';
    previewButton.removeEventListener('click', restoreEditor);
    previewButton.addEventListener('click', getPreview);
    document.documentElement.scrollTop = document.body.scrollTop = editorPos;
    previousElement.focus();
  };

  previewButton.addEventListener('click', getPreview);
  backToEditor.addEventListener('click', restoreEditor);

  submitButton.addEventListener('click', function() {
    // We only do this check for submissions, not downloads, since users
    // should always be able to download their own work
    if (!licenseCheckbox.checked) {
      licenseWarning.style.display = 'inline';
      return false;
    }
    if (allGood()) {
      var sheet = editor.getValue();
      var url = conf.baseUrl + '_api/sheet/' + sheet.head.aliases[0];
      var sheetData = JSON.stringify(sheet, null, 2);
      var req = new XMLHttpRequest();
      var processResponse = function() {
        setTimeout(function() {
          submitButton.disabled = false;
        }, 3000);
        if (this.status == 200) {
          successMessage.style.display = 'inline';
          failureMessage.style.display = 'none';
        } else {
          successMessage.style.display = 'none';
          failureMessage.style.display = 'inline';
        }
      };
      req.open('POST', url, true);
      req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      req.addEventListener('load', processResponse);
      req.send(sheetData);
      submitButton.disabled = true; // Briefly disable to avoid double submissions
    }
  });
})();
