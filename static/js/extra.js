let scrollEnded = false;

let scrollMarker = document.getElementById('scrollmarker')
let options = {
  root: null,
  rootMargin: '0px',
  threshold: 1.0
}

let observer = new IntersectionObserver(function(intersections) {
  if (scrollEnded !== false) {
    return;
  }
  intersections.forEach((intersection) => {
    if (intersection.isIntersecting) {
      scrollEnded = intersection.time;
    }
  });
}, options);
observer.observe(scrollMarker);

function logData() {
  let h = document.documentElement, 
    b = document.body,
    st = 'scrollTop',
    sh = 'scrollHeight';

  let scroll = (h.scrollHeight || b.scrollHeight) - h.clientHeight;
  let max = (h.scrollTop||b.scrollTop);
  let now = Date.now();
  let perfEntries = performance.getEntriesByType("navigation");
  let entry = perfEntries[0].toJSON();

  if (Number.isNaN(max / scroll)) {
    scrollEnded = false;
  }

  let analytics = {
    p: window.location.pathname,
    d: now - window.___pageLoadTime,
    rt: scrollEnded || null,
  };

  navigator.sendBeacon("/perf/pageview", new Blob([JSON.stringify(analytics)], { type: 'text/plain' }));
}
window.addEventListener("unload", logData);
