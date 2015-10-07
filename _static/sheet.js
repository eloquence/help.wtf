(function() {
  'use strict';
  if (Selection.prototype.removeAllRanges && Selection.prototype.addRange) {
    var nl = document.querySelectorAll('.copyBtn');
    var makeCopyClickHandler = function(element) {
      return function() {
        var codeField = element.previousElementSibling.querySelector('code');
        var range = document.createRange();
        range.selectNode(codeField);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        // Works in Chrome, should work in FF starting with version 41
        // Unfortunately not properly feature-detectable.
        try {
          document.execCommand('copy');
        } catch (e) {
          var msg = 'Your browser only supports selection, not copying.';
          if (element.nextSibling.className === 'warning') {
            element.nextSibling.innerHTML = msg;
          } else {
            var warningElement = document.createElement('div');
            warningElement.className = 'warning';
            warningElement.innerHTML = msg;
            element.parentElement.insertBefore(warningElement, element.nextSibling);
          }
        }
      };
    };
    for (var i = 0; i < nl.length; i++) {
      nl[i].setAttribute('style', 'display:inline;');
      nl[i].addEventListener('click', makeCopyClickHandler(nl[i]), false);
    }
  }
  var searchBox = document.querySelector('#searchSheets');
  var content = document.getElementById('content');
  var oldContent = content.innerHTML;
  var oldLocation = window.location.href;
  var oldPlaceholder = searchBox.placeholder;
  var footer = document.getElementById('footer');

  searchBox.addEventListener('focus', function() {
    searchBox.placeholder = 'Prefix your search with : to filter headings on this page';
  });
  searchBox.addEventListener('blur', function() {
    searchBox.placeholder = oldPlaceholder;
  });
  searchBox.addEventListener('keydown', function(e) {
    if (e.keyCode == 13) {
      footer.style.display = 'block';
      // #TODO:20 Needs better check if we show some text for no results
      if (content.innerHTML) {
        oldContent = content.innerHTML;
        oldLocation = window.location.href;
        // If we have changed sheets, we need to update state so that
        // subsequent filter actions are performed on the new sheet
        if (searchBox.value.substr(0,1) !== ':') {
          var i = searchBox.value.indexOf(':');
          if (i !== -1)
            state.sheet = searchBox.value.substr(0, i); // Strip :filter
          else
            state.sheet = searchBox.value;
        }
      } else {
        content.innerHTML = oldContent;
        if (window.location.href !== oldLocation)
          window.history.pushState("string", "sheet", oldLocation);
      }
      searchBox.value = '';
      searchBox.blur();
    }
  });
  searchBox.addEventListener('input', function() {
    if (searchBox.value && searchBox.value !== ':') {
      var val = searchBox.value;

      // If search string starts with :, we filter on the current sheet
      // and have to pass it along
      var current = '';
      if (val.substr(0, 1) == ':') {
        val = val.slice(1); // We don't want to URI-encode the ':'
        current = state.sheet + ':';
      }

      var showResult = function() {
        if (this.status == 404) {
          content.innerHTML = '';
          footer.style.display = 'none';
        } else {
          content.innerHTML = this.responseText;
          footer.style.display = 'block';
          var newLocation = conf.baseUrl + current + encodeURIComponent(val);
          window.history.pushState("string", "sheet", newLocation);
        }
      };
      var url = conf.baseUrl + '_api/sheet/' + current + encodeURIComponent(val);
      var req = new XMLHttpRequest();
      req.addEventListener('load', showResult);
      req.open('GET', url, true);
      req.send();
    } else {
      footer.style.display = 'block';
      content.innerHTML = oldContent;
      if (window.location.href !== oldLocation)
        window.history.pushState("string", "sheet", oldLocation);
    }
  });
})();
