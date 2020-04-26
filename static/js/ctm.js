var script = document.createElement('script');
var supportsDeferredScripts = "defer" in script && "async" in script;
window["ctm"] = (typeof document.documentElement.dataset === 'object' && ('visibilityState' in document) && supportsDeferredScripts);
