// XHook - v0.1.0 - https://github.com/jpillora/xhook
// © Jaime Pillora <dev@jpillora.com>  2013
(function(window,document,undefined) {
var EVENTS, FNS, PROPS, READY_STATE, RESPONSE_TEXT, WITH_CREDS, convertHeaders, create, patchClass, patchXhr, xhook,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"];

EVENTS = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"];

PROPS = ["readyState", "responseText", "withCredentials", "statusText", "status", "response", "responseType", "responseXML", "upload"];

READY_STATE = PROPS[0];

RESPONSE_TEXT = PROPS[1];

WITH_CREDS = PROPS[2];

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

convertHeaders = function(h, dest) {
  var header, headers, k, v, _i, _len;
  if (dest == null) {
    dest = {};
  }
  switch (typeof h) {
    case "object":
      headers = [];
      for (k in h) {
        v = h[k];
        headers.push("" + k + ":\t" + v);
      }
      return headers.join('\n');
    case "string":
      headers = h.split('\n');
      for (_i = 0, _len = headers.length; _i < _len; _i++) {
        header = headers[_i];
        if (/([^:]+):\s*(.+)/.test(header)) {
          if (!dest[RegExp.$1]) {
            dest[RegExp.$1] = RegExp.$2;
          }
        }
      }
      return dest;
  }
};

xhook.headers = convertHeaders;

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
  x = {};
  x[WITH_CREDS] = false;
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
    var _results;
    hooked = true;
    userSets[prop] = 1;
    if (prop === READY_STATE) {
      _results = [];
      while (x[READY_STATE] < val) {
        x[READY_STATE]++;
        if (x[READY_STATE] === xhr[READY_STATE]) {
          continue;
        }
        user.set(READY_STATE, x[READY_STATE]);
        user.trigger('readystatechange');
        if (x[READY_STATE] === 1) {
          user.trigger('loadstart');
        }
        if (x[READY_STATE] === 4) {
          user.trigger('load');
          _results.push(user.trigger('loadend'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      return x[prop] = val;
    }
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
    user.set(READY_STATE, 4);
    return null;
  };
  user.serialize = function() {
    var p, props, _i, _len;
    props = {};
    for (_i = 0, _len = PROPS.length; _i < _len; _i++) {
      p = PROPS[_i];
      props[p] = x[p];
    }
    return {
      method: data.method,
      url: data.url,
      async: data.async,
      body: data.body,
      responseHeaders: userResponseHeaders,
      requestHeaders: userRequestHeaders,
      props: props
    };
  };
  user.deserialize = function(obj) {
    var h, k, p, v, _i, _len, _ref, _ref1, _ref2, _ref3;
    _ref = ['method', 'url', 'async', 'body'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      k = _ref[_i];
      if (obj[k]) {
        user[k] = obj[k];
      }
    }
    _ref1 = obj.responseHeaders || {};
    for (h in _ref1) {
      v = _ref1[h];
      user.setResponseHeader(h, v);
    }
    _ref2 = obj.requestHeaders || {};
    for (h in _ref2) {
      v = _ref2[h];
      user.setRequestHeader(h, v);
    }
    _ref3 = obj.props || {};
    for (p in _ref3) {
      v = _ref3[p];
      user.set(p, v);
    }
  };
  _fn = function(key) {
    return x[key] = function() {
      var args, callback, callbacks, newargs, result, _j, _len1;
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
          return convertHeaders(userResponseHeaders);
        case "send":
          data.body = newargs[0];
          break;
        case "open":
          data.method = newargs[0];
          data.url = newargs[1];
          data.async = newargs[2];
          break;
        case "setRequestHeader":
          requestHeaders[newargs[0]] = newargs[1];
          if (userRequestHeaders[newargs[0]] !== undefined) {
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
    var callback, callbacks, key, override, prev, result, val, _j, _len1;
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
        convertHeaders(xhr.getAllResponseHeaders(), responseHeaders);
      }
    }
    callbacks = userOnChanges[prop] || [];
    for (_j = 0, _len1 = callbacks.length; _j < _len1; _j++) {
      callback = callbacks[_j];
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