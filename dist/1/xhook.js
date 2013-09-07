// XHook - v1.0.0 - https://github.com/jpillora/xhook
// Jaime Pillora <dev@jpillora.com> - MIT Copyright 2013
(function(window,document,undefined) {
var EventEmitter, READY_STATE, XHOOK, convertHeaders, patchClass, patchXhr, pluginEvents, xhook,
  __slice = [].slice;

XHOOK = 'xhook';

READY_STATE = 'readyState';

EventEmitter = function(ctx) {
  var emitter, events;
  ({
    stats: {}
  });
  events = {};
  emitter = {
    stats: stats,
    on: function(event, callback, i) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].splice(i || events[event].length, 0, callback);
    },
    off: function(event, callback) {
      var f, i, r, _i, _len, _ref;
      if (!events[event]) {
        return;
      }
      r = -1;
      _ref = events[event];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        f = _ref[i];
        if (f === fn) {
          r = i;
        }
      }
      if (r === -1) {
        return;
      }
      events[event].splice(r, 1);
    },
    each: function(event, callback) {
      var cb, _i, _len, _ref;
      if (!events[event]) {
        return;
      }
      stats[event] = (stats[event] + 1) || 1;
      _ref = events[event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        callback(cb);
      }
    },
    fire: function() {
      var args, event;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      emitter.each(event, function(fn) {
        return fn.apply(ctx, args);
      });
    }
  };
  return emitter;
};

pluginEvents = EventEmitter();

xhook = function(callback, i) {
  return pluginEvents.on(XHOOK, callback, i);
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

xhook.PROPS = PROPS;

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
    return patchXhr(new Class(arg));
  };
};

patchClass("ActiveXObject");

patchClass("XMLHttpRequest");

patchXhr = function(xhr) {
  var checkEvent, face, readys, request, response, setReadyState, targetState, user, xhrEvents;
  readys = [];
  targetState = 0;
  request = {
    headers: {}
  };
  response = {
    headers: {}
  };
  xhrEvents = EventEmitter();
  user = {
    request: request,
    response: response
  };
  user.serialize = function() {
    return {
      request: request,
      response: response
    };
  };
  user.deserialize = function(obj) {
    request = obj.request;
    return response = obj.response;
  };
  setReadyState = function(n) {
    face[READY_STATE] = n;
    return xhrEvents.fire("readystatechange");
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
  xhr.onreadystatechange = function(event) {
    var key, val, _ref;
    readys.push(checkEvent(event));
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
      response.resp = xhr.response;
      response.body = xhr.responseText;
      return response.xml = xhr.responseXML;
    }
  };
  face = {
    withCredentials: false
  };
  face.addEventListener = xhrEvents.on;
  face.removeEventListener = xhrEvents.off;
  face.dispatchEvent = function() {};
  face.open = function(method, url, async) {
    request.method = method;
    request.url = url;
    request.async = async;
    targetState = 1;
  };
  face.send = function(body) {
    var send;
    request.body = body;
    send = function() {
      xhr.open(request.method, request.url, request.async);
      xhr.send(request.body);
      return targetState = 4;
    };
    if (user.beforeSend) {
      user.beforeSend(send);
    } else {
      send();
    }
  };
  face.abort = function() {};
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
  pluginEvents.fire(XHOOK, user);
  return face;
};

window[XHOOK] = xhook;
}(window,document));