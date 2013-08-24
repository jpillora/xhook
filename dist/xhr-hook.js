// XHR Hook - v0.1.0 - https://github.com/jpillora/xhr-hook
// © Jaime Pillora <dev@jpillora.com> 2013
(function(window,document,undefined) {
var consts, events, fns, patchClass, patchXhr, status;

consts = ["UNSENT", "OPENED", "HEADERS_RECEIVED", "LOADING", "DONE"];

fns = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"];

events = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"];

status = ["statusText", "status", "response", "responseType", "responseXML", "responseText", "upload", "readyState", "withCredentials"];

patchXhr = function(xhr, Class) {
  var copyFn, copyStatus, i, proxyEvent, req, res, x;
  x = {
    withCredentials: false
  };
  i = void 0;
  req = {
    headers: {}
  };
  res = {
    headers: {}
  };
  copyStatus = function() {
    var _results;
    try {
      _results = [];
      for (i in status) {
        _results.push(x[status[i]] = (status[i] === "responseText" ? xhr[status[i]].replace(/[aeiou]/g, "z") : xhr[status[i]]));
      }
      return _results;
    } catch (_error) {}
  };
  copyFn = function(key) {
    return x[key] = function() {
      switch (key) {
        case "send":
          req.data = arguments_[0];
          break;
        case "open":
          req.method = arguments_[0];
          req.url = arguments_[1];
          req.async = arguments_[2];
          break;
        case "setRequestHeader":
          req.headers[arguments_[0]] = arguments_[1];
      }
      if (xhr[key]) {
        return xhr[key].apply(xhr, arguments_);
      }
    };
  };
  for (i in fns) {
    copyFn(fns[i]);
  }
  proxyEvent = function(key) {
    return xhr[key] = function() {
      copyStatus();
      if (x[key] && xhr.readyState === 4) {
        console.log(req);
      }
      if (x[key]) {
        return x[key].apply(x, arguments_);
      }
    };
  };
  for (i in events) {
    proxyEvent(events[i]);
  }
  return x;
};

patchClass = function(name) {
  var Class;
  Class = window[name];
  if (!Class) {
    return;
  }
  return window[name] = function(arg) {
    if (typeof arg === "string" && !/\.XMLHTTP/.test(arg)) {
      return;
    }
    return patchXhr(new Class(arg), Class);
  };
};

patchClass("ActiveXObject");

patchClass("XMLHttpRequest");
}(window,document));