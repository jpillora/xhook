// XHook - v0.1.0 - https://github.com/jpillora/xhook
// © Jaime Pillora <dev@jpillora.com> 2013
(function(window,document,undefined) {
var EVENTS, FNS, PROPS, READY_STATE, RESPONSE_TEXT, create, patchClass, patchXhr, xhook,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"];

EVENTS = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"];

PROPS = ["readyState", "responseText", "statusText", "status", "response", "responseType", "responseXML", "upload", "withCredentials"];

READY_STATE = PROPS[0];

RESPONSE_TEXT = PROPS[1];

create = function(parent) {
  var F;
  F = function() {};
  F.prototype = parent;
  return new F;
};

xhook = function(callback) {
  return xhook.s.push(callback);
};

xhook.s = [];

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

patchXhr = function(xhr, Class) {
  var callback, cloneEvent, data, eventName, fn, hooked, key, requestHeaders, responseHeaders, setAllValues, setValue, user, userOnCalls, userOnChanges, userRequestHeaders, userResponseHeaders, userSets, x, xhrDup, _fn, _fn1, _i, _j, _k, _len, _len1, _len2, _ref;
  hooked = false;
  xhrDup = {};
  x = {
    withCredentials: false
  };
  requestHeaders = {};
  responseHeaders = {};
  data = {};
  cloneEvent = function(e) {
    var clone, key, val;
    clone = {};
    for (key in e) {
      val = e[key];
      clone[key] = val === xhr ? x : val;
    }
    return clone;
  };
  user = create(data);
  userSets = {};
  user.set = function(prop, val) {
    hooked = true;
    userSets[prop] = 1;
    return x[prop] = val;
  };
  userRequestHeaders = {};
  user.setRequestHeader = function(key, val) {
    hooked = true;
    userRequestHeaders[key] = val;
    if (!data.opened) {
      return;
    }
    return xhr.setRequestHeader(key, val);
  };
  userResponseHeaders = create(responseHeaders);
  user.setResponseHeader = function(key, val) {
    hooked = true;
    return userResponseHeaders[key] = val;
  };
  userOnChanges = {};
  userOnCalls = {};
  user.onChange = function(event, callback) {
    hooked = true;
    return (userOnChanges[event] = userOnChanges[event] || []).push(callback);
  };
  user.onCall = function(event, callback) {
    hooked = true;
    return (userOnCalls[event] = userOnCalls[event] || []).push(callback);
  };
  user.trigger = function(event, obj) {
    var _ref;
    if (obj == null) {
      obj = {};
    }
    event = event.replace(/^on/, '');
    obj.type = event;
    return (_ref = x['on' + event]) != null ? _ref.call(x, obj) : void 0;
  };
  user.triggerComplete = function() {
    var curr;
    while (x[READY_STATE] <= 4) {
      curr = x[READY_STATE] + 1;
      user.set(READY_STATE, curr);
      user.trigger('readystatechange');
      if (curr === 1) {
        user.trigger('loadstart');
      }
      if (curr === 4) {
        user.trigger('load');
        user.trigger('loadend');
      }
    }
    return null;
  };
  _fn = function(key) {
    return x[key] = function() {
      var args, callback, callbacks, headers, k, newargs, result, v, _j, _len1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      newargs = args;
      callbacks = userOnCalls[key] || [];
      for (_j = 0, _len1 = callbacks.length; _j < _len1; _j++) {
        callback = callbacks[_j];
        result = callback(args);
        if (result === false) {
          return;
        }
        if (result) {
          newargs = result;
        }
      }
      switch (key) {
        case "getAllResponseHeaders":
          headers = [];
          for (k in userResponseHeaders) {
            v = userResponseHeaders[k];
            headers.push("" + k + ":\t" + v);
          }
          return headers.join('\n');
        case "send":
          data.data = newargs[0];
          break;
        case "open":
          data.method = newargs[0];
          data.url = newargs[1];
          data.async = newargs[2];
          break;
        case "setRequestHeader":
          requestHeaders[newargs[0]] = newargs[1];
          if (userRequestHeaders[newargs[0]]) {
            return;
          }
      }
      data.opened = !data.opened && key === 'open';
      data.sent = !data.sent && key === 'send';
      if (xhr[key]) {
        return xhr[key].apply(xhr, newargs);
      }
    };
  };
  for (_i = 0, _len = FNS.length; _i < _len; _i++) {
    fn = FNS[_i];
    _fn(fn);
  }
  setAllValues = function() {
    var err, prop, _j, _len1, _results;
    try {
      _results = [];
      for (_j = 0, _len1 = PROPS.length; _j < _len1; _j++) {
        prop = PROPS[_j];
        _results.push(setValue(prop, xhr[prop]));
      }
      return _results;
    } catch (_error) {
      err = _error;
      if (err.constructor.name === 'TypeError') {
        throw err;
      }
    }
  };
  setValue = function(prop, curr) {
    var callback, callbacks, h, header, headers, key, override, prev, result, val, _j, _k, _len1, _len2;
    prev = xhrDup[prop];
    if (curr === prev) {
      return;
    }
    xhrDup[prop] = curr;
    if (prop === READY_STATE) {
      if (curr === 1) {
        for (key in userRequestHeaders) {
          val = userRequestHeaders[key];
          xhr.setRequestHeader(key, val);
        }
      }
      if (curr === 2) {
        data.statusCode = xhr.status;
        headers = xhr.getAllResponseHeaders().split('\n');
        for (_j = 0, _len1 = headers.length; _j < _len1; _j++) {
          header = headers[_j];
          h = /([^:]+):\s*(.*)/.test(header) ? {
            k: RegExp.$1,
            v: RegExp.$2
          } : void 0;
          if (h && !responseHeaders[h.k]) {
            responseHeaders[h.k] = h.v;
          }
        }
      }
    }
    callbacks = userOnChanges[prop] || [];
    for (_k = 0, _len2 = callbacks.length; _k < _len2; _k++) {
      callback = callbacks[_k];
      result = callback(curr, prev);
      if (result !== undefined) {
        override = result;
      }
    }
    if (userSets[prop]) {
      return;
    }
    return x[prop] = override === undefined ? curr : override;
  };
  _fn1 = function(eventName) {
    return xhr[eventName] = function(event) {
      var copy;
      setAllValues();
      if (event) {
        copy = cloneEvent(event);
      }
      (window.E = window.E || []).push(copy);
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
  _ref = xhook.s;
  for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
    callback = _ref[_k];
    callback.call(null, user);
  }
  if (hooked) {
    return x;
  } else {
    return xhr;
  }
};

window.xhook = xhook;
}(window,document));