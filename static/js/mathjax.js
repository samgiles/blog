(function() { 
  if (window["ctm"]) {
    var ready = false;
    window["MathJax"] = {
      "tex": {
        "inlineMath": [
          ['$', '$'], ['\\(', '\\)']
        ],
        "processEscapes": true,
        "processEnvironments": true
      },
      "options": {
        "skipHtmlTags": ['script', 'noscript', 'style', 'textarea', 'pre']
      },
      "startup": {
        "ready": function() {
          if (ready) {
            window["MathJax"]["startup"]["defaultReady"]();
          } else {
            document.addEventListener('u.DOMContentLoaded', function() {
              window["MathJax"]["startup"]["defaultReady"]();
            });
          }
        }
      }
    };
    document.addEventListener('u.DOMContentLoaded', function() {
      ready = true;
    });
    var script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.id = 'MathJax-script';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(script, s);
  }
}());
