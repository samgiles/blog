window.addEventListener('DOMContentLoaded', function(ev) {
  function loadsrcs(srcs) {
      var i = srcs.length;
      var frag = document.createDocumentFragment();
      while(i--) {
        var s = document.createElement('script');
        var e = srcs[i];
        if (e[1]) {
          s.defer = true;
        }
        s.src = e[0];
        frag.appendChild(s);
      }
      var sel = document.getElementsByTagName('script')[0];
      sel.parentNode.insertBefore(frag, sel);
  }
  var srcs = [];
  if ('ArrayBuffer' in window && 'DataView' in window && 'Uint8Array' in window && 'Blob' in window && 'sendBeacon' in navigator) {
    window.___pageLoadTime = Date.now();
    srcs.push(['/js/extra.min.js', true]);
  }
  
  if (!('Promise' in window)) {
    srcs.push(["https://polyfill.io/v3/polyfill.min.js?features=es6", false]);
  }

  if (srcs.length > 0) {
    loadsrcs(srcs);
  }
});

