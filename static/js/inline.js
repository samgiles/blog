(function() {
  var dcl = "DOMContentLoaded";
  if (!window["ctm"]) {
    return;
  }
  var hasFired = {};
  function trigger(type) {
    if (type in hasFired) {
      return;
    }
    hasFired[type] = true;
    document.dispatchEvent(new CustomEvent('u.'+type));
  }

  document.addEventListener(dcl, trigger.bind(null, dcl));

  function readystatechange() {
    if (document.readyState === 'complete') {
      trigger(dcl);
    } else if (document.readyState === 'interactive' && !document.attachEvent) {
      trigger(dcl);
    }
  }

  document.onreadystatechange = readystatechange;
  readystatechange();
}());
