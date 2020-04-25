function pageMetrics() {
  let path = window.location.pathname;
  let didScroll = false;
  let scrollEnded = false;
  let scrollMarker = document.getElementById('scrollmarker')
  let options = { rootMargin: '0px', threshold: 1.0, };

  if (window.IntersectionObserver) {
    let observer = new IntersectionObserver(function(intersections) {
      if (scrollEnded !== false) {
        return;
      }
      intersections.forEach((intersection) => {
        if (intersection.isIntersecting) { scrollEnded = intersection.time; }
      });
    }, options);
    observer.observe(scrollMarker);
  }

  function handleScroll() {
    didScroll = true;
    window.removeEventListener('scroll', handleScroll);
  }
  window.addEventListener('scroll', handleScroll);

  return () => {
    let now = Date.now();
    let dwell = now - window.___pageLoadTime;
    let readTime = didScroll ? scrollEnded || undefined || undefined : undefined;

    return {
      path,
      dwell,
      readTime,
    };
  };
}

function getEffectiveConnectionType() {
  let connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let connectionType = '4g';
  if (connection !== undefined) {
    connectionType = connection.effectiveType || connectionType;
  }
  return connectionType;
}

function collectTiming() {
  let [entry] = performance.getEntriesByType('navigation');
  let unloadTime = entry.unloadEventEnd - entry.unloadEventStart;
  let redirectCount = entry.redirectCount;
  let redirectTime = entry.redirectEnd - entry.redirectStart;
  let dnsResolutionTime = entry.domainLookupEnd - entry.domainLookupStart;
  let handshakeTime = entry.secureConnectionStart - entry.connectStart;
  let connectTime = entry.connectEnd - entry.connectStart;
  let timeToFirstByte = entry.responseStart - entry.requestStart;
  let responseComplete = entry.responseEnd - entry.responseStart;
  let timeToInteractive = entry.domInteractive - entry.responseEnd;
  let domLoaded = entry.domContentLoadedEventStart - entry.domInteractive;
  let domContentLoadedEventTime = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
  let complete = entry.domComplete - entry.domContentLoadedEventEnd;

  return {
    net: getEffectiveConnectionType(),
    timing: [
      unloadTime,
      redirectCount,
      redirectTime,
      dnsResolutionTime,
      handshakeTime,
      connectTime,
      timeToFirstByte,
      responseComplete,
      timeToInteractive,
      domLoaded,
      domContentLoadedEventTime,
      complete,
    ],
  };
}

function serialize(values) {
  // 32bit floats
  let buffer = new ArrayBuffer(values.length * 4);
  let view = new DataView(buffer);
  for(let idx = 0; idx < values.length; idx++) {
    view.setFloat32(idx * 4, values[idx]);
  }
  return new Uint8Array(buffer);
}

(function() {
  let metrics = pageMetrics();
  let idleCallback = window.requestIdleCallback || function(handler) { window.setTimeout(() => handler(), 1); };
  let timingInfo = false;

  idleCallback(() => {
    timingInfo = collectTiming();
  });

  window.addEventListener("beforeunload", () => {
    let page = metrics();
    let blob = serialize([
      page.dwell,
      page.readTime || -1,
    ].concat(timingInfo.timing));
    navigator.sendBeacon("/perf/pageview?n="+timingInfo.net, new Blob([blob.buffer], {type:"text/plain"}));
  });
}());
