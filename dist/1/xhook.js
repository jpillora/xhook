// XHook - v1.0.0 - https://github.com/jpillora/xhook
// Jaime Pillora <dev@jpillora.com> - MIT Copyright 2013
(function(window,document,undefined) {
var AFTER, BEFORE, EventEmitter, INVALID_PARAMS_ERROR, READY_STATE, convertHeaders, createXHRFacade, patchClass, pluginEvents, xhook, _base,
  __slice = [].slice;

BEFORE = 'before';

AFTER = 'after';

READY_STATE = 'readyState';

INVALID_PARAMS_ERROR = "Invalid number or parameters. Please see API documentation.";

(_base = Array.prototype).indexOf || (_base.indexOf = function(item) {
  var i, x, _i, _len;
  for (i = _i = 0, _len = this.length; _i < _len; i = ++_i) {
    x = this[i];
    if (x === item) {
      return i;
    }
  }
  return -1;
});

EventEmitter = function(ctx) {
  var emitter, events, listeners;
  events = {};
  listeners = function(event) {
    return events[event] || [];
  };
  emitter = {
    listeners: function(event) {
      return Array.prototype.slice.call(listeners(event));
    },
    on: function(event, callback, i) {
      events[event] = listeners(event);
      if (events[event].indexOf(callback) >= 0) {
        return;
      }
      i = i === undefined ? events[event].length : i;
      events[event].splice(i, 0, callback);
    },
    off: function(event, callback) {
      var i;
      i = listeners(event).indexOf(callback);
      if (i === -1) {
        return;
      }
      listeners(event).splice(i, 1);
    },
    fire: function() {
      var args, event, listener, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = listeners(event);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener.apply(ctx, args);
      }
    }
  };
  return emitter;
};

pluginEvents = EventEmitter();

xhook = {};

xhook[BEFORE] = function(handler, i) {
  return pluginEvents.on(BEFORE, handler, i);
};

xhook[AFTER] = function(handler, i) {
  return pluginEvents.on(AFTER, handler, i);
};

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
    return createXHRFacade(new Class(arg));
  };
};

patchClass("ActiveXObject");

patchClass("XMLHttpRequest");

createXHRFacade = function(xhr) {
  var checkEvent, currentState, extractListeners, face, readyBody, readyHead, request, response, setReadyState, transiting, xhrEvents;
  transiting = false;
  request = {
    timeout: 0,
    headers: {}
  };
  response = null;
  xhrEvents = EventEmitter();
  readyHead = function() {
    face.status = response.status;
    face.statusText = response.statusText;
    response.headers || (response.headers = {});
  };
  readyBody = function() {
    face.responseType = response.type || '';
    face.response = response.body || null;
    face.responseText = response.text || response.body || '';
    face.responseXML = response.xml || null;
  };
  currentState = 0;
  setReadyState = function(n) {
    var fire, hooks, process;
    extractListeners();
    fire = function() {
      while (n > currentState && currentState < 4) {
        face[READY_STATE] = ++currentState;
        if (currentState === 2) {
          readyHead();
        }
        if (currentState === 4) {
          readyBody();
        }
        xhrEvents.fire("readystatechange");
        if (currentState === 4) {
          xhrEvents.fire("load");
        }
      }
    };
    if (n < 4) {
      return fire();
    }
    hooks = pluginEvents.listeners(AFTER);
    process = function() {
      var hook;
      if (!hooks.length) {
        return fire();
      }
      hook = hooks.shift();
      if (hook.length === 2) {
        hook(request, response);
        return process();
      } else if (hook.length === 3) {
        return hook(request, response, process);
      } else {
        throw INVALID_PARAMS_ERROR;
      }
    };
    process();
  };
  checkEvent = function(e) {
    var clone, key, val;
    clone = {};
    for (key in e) {
      val = e[key];
      clone[key] = val === xhr ? face : val;
    }
    return clone;
  };
  extractListeners = function() {
    var fn, key, _results;
    _results = [];
    for (key in face) {
      fn = face[key];
      if (typeof fn === 'function' && /^on(\w+)/.test(key)) {
        _results.push(xhrEvents.on(RegExp.$1, fn));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  xhr.onreadystatechange = function(event) {
    var key, val, _ref;
    if (xhr[READY_STATE] === 2) {
      response.status = xhr.status;
      response.statusText = xhr.statusText;
      _ref = convertHeaders(xhr.getAllResponseHeaders());
      for (key in _ref) {
        val = _ref[key];
        if (!response.headers[key]) {
          response.headers[key] = val;
        }
      }
    }
    if (xhr[READY_STATE] === 4) {
      transiting = false;
      response.type = xhr.responseType;
      response.text = xhr.responseText;
      response.body = xhr.response || response.text;
      response.xml = xhr.responseXML;
      setReadyState(xhr[READY_STATE]);
    }
  };
  face = {
    withCredentials: false,
    response: null,
    status: 0
  };
  face.addEventListener = xhrEvents.on;
  face.removeEventListener = xhrEvents.off;
  face.dispatchEvent = function() {};
  face.open = function(method, url, async) {
    request.method = method;
    request.url = url;
    request.async = async;
    setReadyState(1);
  };
  face.send = function(body) {
    var hooks, process, send;
    request.body = body;
    send = function() {
      var header, value, _ref;
      response = {
        headers: {}
      };
      transiting = true;
      xhr.open(request.method, request.url, request.async);
      _ref = request.headers;
      for (header in _ref) {
        value = _ref[header];
        xhr.setRequestHeader(header, value);
      }
      xhr.send(request.body);
    };
    hooks = pluginEvents.listeners(BEFORE);
    process = function() {
      var done, hook;
      if (!hooks.length) {
        return send();
      }
      hook = hooks.shift();
      done = function(resp) {
        if (typeof resp === 'object' && typeof resp.status === 'number') {
          response = resp;
          setReadyState(4);
        } else {
          return process();
        }
      };
      if (hook.length === 1) {
        return done(hook(request));
      } else if (hook.length === 2) {
        return hook(request, done);
      } else {
        throw INVALID_PARAMS_ERROR;
      }
    };
    process();
  };
  face.abort = function() {
    if (transiting) {
      return xhr.abort();
    }
  };
  face.setRequestHeader = function(header, value) {
    return request.headers[header] = value;
  };
  face.getResponseHeader = function(header) {
    return response.headers[header];
  };
  face.getAllResponseHeaders = function() {
    return convertHeaders(response.headers);
  };
  face.overrideMimeType = function() {};
  face.upload = {};
  return face;
};

window.xhook = xhook;
}(window,document));