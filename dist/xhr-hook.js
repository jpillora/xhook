// XHR Hook - v0.1.0 - https://github.com/jpillora/xhr-hook
// © Jaime Pillora <dev@jpillora.com> 2013
(function(window,document,undefined) {
var EVENTS, FNS, PROPS, XHRHook, create, patchClass, patchXhr,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"];

EVENTS = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"];

PROPS = ["statusText", "status", "response", "responseType", "responseXML", "responseText", "upload", "readyState", "withCredentials"];

create = function(parent) {
  var F;
  F = function() {};
  F.prototype = parent;
  return new F;
};

XHRHook = function(callback) {
  return XHRHook.s.push(callback);
};

XHRHook.s = [];

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
    console.log('creating a ' + name);
    return patchXhr(new Class(arg), Class);
  };
};

patchClass("ActiveXObject");

patchClass("XMLHttpRequest");

patchXhr = function(xhr, Class) {
  var callback, cloneEvent, data, eventName, fn, key, setAllValues, setValue, user, x, xhrDup, _fn, _fn1, _i, _j, _k, _len, _len1, _len2, _ref;
  xhrDup = {};
  x = {
    withCredentials: false
  };
  data = {
    requestHeaders: {},
    responseHeaders: {}
  };
  user = create(data);
  user.callbacks = [];
  user.on = function(event, callback) {
    return (user.callbacks[event] || (user.callbacks[event] = [])).push(callback);
  };
  _fn = function(key) {
    return x[key] = function() {
      var args, callback, callbacks, newargs, result, ret, _j, _len1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (key) {
        case "send":
          data.data = args[0];
          break;
        case "open":
          data.method = args[0];
          data.url = args[1];
          data.async = args[2];
          break;
        case "setRequestHeader":
          data.requestHeaders[args[0]] = args[1];
      }
      newargs = args;
      callbacks = user.callbacks["call:" + key];
      if (callbacks) {
        for (_j = 0, _len1 = callbacks.length; _j < _len1; _j++) {
          callback = callbacks[_j];
          result = callback(args);
          if (result) {
            newargs = result;
          }
        }
      }
      if (xhr[key]) {
        ret = xhr[key].apply(xhr, newargs);
      }
      return ret;
    };
  };
  for (_i = 0, _len = FNS.length; _i < _len; _i++) {
    fn = FNS[_i];
    _fn(fn);
  }
  setAllValues = function() {
    var prop, _j, _len1, _results;
    try {
      _results = [];
      for (_j = 0, _len1 = PROPS.length; _j < _len1; _j++) {
        prop = PROPS[_j];
        _results.push(setValue(prop, xhr[prop]));
      }
      return _results;
    } catch (_error) {}
  };
  setValue = function(prop, curr) {
    var callback, callbacks, h, header, headers, override, prev, result, _j, _k, _len1, _len2;
    prev = xhrDup[prop];
    if (curr === prev) {
      return;
    }
    xhrDup[prop] = curr;
    if (prop === 'readyState' && curr === 2) {
      data.statusCode = xhr.status;
      headers = xhr.getAllResponseHeaders().split('\n');
      for (_j = 0, _len1 = headers.length; _j < _len1; _j++) {
        header = headers[_j];
        h = /([^:]+):\s*(.*)/.test(header) ? {
          k: RegExp.$1,
          v: RegExp.$2
        } : void 0;
        if (h) {
          data.responseHeaders[h.k] = h.v;
        }
      }
    }
    callbacks = user.callbacks["set:" + prop];
    if (callbacks) {
      for (_k = 0, _len2 = callbacks.length; _k < _len2; _k++) {
        callback = callbacks[_k];
        result = callback(curr, prev);
        if (result !== undefined) {
          override = result;
        }
      }
    }
    return x[prop] = override === undefined ? curr : override;
  };
  cloneEvent = function(e) {
    var clone, key, val;
    clone = {};
    for (key in e) {
      val = e[key];
      clone[key] = val === xhr ? x : val;
    }
    return clone;
  };
  _fn1 = function(eventName) {
    return xhr[eventName] = function(event) {
      var copy;
      setAllValues();
      if (event) {
        copy = cloneEvent(event);
      }
      if (x[eventName]) {
        return x[eventName].call(x, copy);
      }
    };
  };
  for (_j = 0, _len1 = EVENTS.length; _j < _len1; _j++) {
    eventName = EVENTS[_j];
    _fn1(eventName);
  }
  setAllValues();
  for (key in xhr) {
    if (x[key] === undefined && __indexOf.call(EVENTS, key) < 0) {
      try {
        x[key] = xhr[key];
      } catch (_error) {}
    }
  }
  _ref = XHRHook.s;
  for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
    callback = _ref[_k];
    callback.call(null, user);
  }
  return x;
};

window.XHRHook = XHRHook;
}(window,document));