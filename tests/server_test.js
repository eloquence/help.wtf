// Run via gulp test
'use strict';
let app = require('../index.js');
let request = require('co-supertest').agent(app.listen());
let tinySheet = {
  "head": {
    "title": "Life",
    "description": "What to do",
    "aliases": ["life"],
  },
  "sections": [{
    "title": "Basics"
  }]
};

describe('API preview', () => {
  it('should reject bad requests', function*() {
    let res = yield request
      .post('/_api/preview')
      .send({})
      .expect(400)
      .end();
  });
  it('should accept good requests', function*() {
    let res = yield request
      .post('/_api/preview')
      .send(tinySheet)
      .expect(200)
      .end();
  });
  it('should render basic formatting', function*() {
    let tinySheetWithMarkup = JSON.parse(JSON.stringify(tinySheet));
    tinySheetWithMarkup.sections[0].content = [{
      title: "Getting up",
      body: "You *have* to get up in the morning"
    }];
    let res = yield request
      .post('/_api/preview')
      .send(tinySheetWithMarkup)
      .expect(/You <em>have<\/em> to get up in the morning/)
      .end();
  });
  it('should sanitize HTML', function*() {
    let tinySheetWithHTML = JSON.parse(JSON.stringify(tinySheet));
    tinySheetWithHTML.sections[0].content = [{
      title: "Getting up",
      body: "You <em>have</em> to get up in the morning"
    }];
    let res = yield request
      .post('/_api/preview')
      .send(tinySheetWithHTML)
      .expect(/You &lt;em&gt;have&lt;\/em&gt; to get up in the morning/)
      .end();
  });
  it('should sanitize HTML inside code blocks', function*() {
    let tinySheetWithCode = JSON.parse(JSON.stringify(tinySheet));
    tinySheetWithCode.sections[0].content = [{
      title: "Getting up",
      body: "You `<b>have</b>` to get up in the morning.\n````\n<i>Really.</i>\n````"
    }];
    let res = yield request
      .post('/_api/preview')
      .send(tinySheetWithCode)
      .expect(/You <code><span class="hljs-tag">&lt;<span class="hljs-title">b<\/span>&gt;<\/span>have<span class="hljs-tag">&lt;\/<span class="hljs-title">b<\/span>&gt;<\/span><\/code> to get up in the morning.<\/p>\n<pre class="codeblock"><code><span class="hljs-tag">&lt;<span class="hljs-title">i<\/span>&gt;<\/span>Really.<span class="hljs-tag">&lt;\/<span class="hljs-title">i<\/span>&gt;<\/span><\/code><\/pre>/)
      .end();
  });

});

describe('/ endpoint', function() {
  it('should return Directory', function*() {
    let res = yield request
      .get('/')
      .expect(200)
      .expect(/Author\(/)
      .end();
  });
});

describe('/es6 cheatsheet', function() {
  it('should return valid cheatsheet', function*() {
    let res = yield request
      .get('/es6')
      .expect(200)
      .expect(/ECMAScript 6 Cheatsheet/)
      .end();
  });
});
