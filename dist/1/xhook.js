// XHook - v1.1.0 - https://github.com/jpillora/xhook
// Jaime Pillora <dev@jpillora.com> - MIT Copyright 2013
(function(window,undefined) {var AFTER, BEFORE, EventEmitter, FIRE, INVALID_PARAMS_ERROR, OFF, ON, READY_STATE, XMLHTTP, convertHeaders, document, xhook, _base,
  __slice = [].slice;

document = window.document;

BEFORE = 'before';

AFTER = 'after';

READY_STATE = 'readyState';

INVALID_PARAMS_ERROR = "Invalid number or parameters. Please see API documentation.";

ON = 'addEventListener';

OFF = 'removeEventListener';

FIRE = 'dispatchEvent';

XMLHTTP = 'XMLHttpRequest';

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

EventEmitter = function(internal) {
  var emitter, events, listeners;
  events = {};
  listeners = function(event) {
    return events[event] || [];
  };
  emitter = {};
  emitter[ON] = function(event, callback, i) {
    events[event] = listeners(event);
    if (events[event].indexOf(callback) >= 0) {
      return;
    }
    i = i === void 0 ? events[event].length : i;
    events[event].splice(i, 0, callback);
  };
  emitter[OFF] = function(event, callback) {
    var i;
    i = listeners(event).indexOf(callback);
    if (i === -1) {
      return;
    }
    listeners(event).splice(i, 1);
  };
  emitter[FIRE] = function() {
    var args, event, i, listener, _i, _len, _ref;
    event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    _ref = listeners(event);
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      listener = _ref[i];
      console.log('FIRE', i, event);
      listener.apply(void 0, args);
    }
  };
  if (internal) {
    emitter.listeners = function(event) {
      return Array.prototype.slice.call(listeners(event));
    };
    emitter.on = emitter[ON];
    emitter.off = emitter[OFF];
    emitter.fire = emitter[FIRE];
  }
  return emitter;
};

xhook = EventEmitter(true);

xhook[BEFORE] = function(handler, i) {
  return xhook[ON](BEFORE, handler, i);
};

xhook[AFTER] = function(handler, i) {
  return xhook[ON](AFTER, handler, i);
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

xhook[XMLHTTP] = window[XMLHTTP];

window[XMLHTTP] = function() {
  var checkEvent, currentState, extractProps, extractedProps, facade, makeFakeEvent, readBody, readHead, request, response, setReadyState, transiting, writeBody, writeHead, xhr;
  xhr = new xhook[XMLHTTP]();
  transiting = false;
  request = EventEmitter(true);
  request.headers = {};
  response = null;
  writeHead = function() {
    facade.status = response.status;
    facade.statusText = response.statusText;
    response.headers || (response.headers = {});
  };
  writeBody = function() {
    facade.responseType = response.type || '';
    facade.response = response.data || null;
    facade.responseText = response.text || response.data || '';
    facade.responseXML = response.xml || null;
  };
  readHead = function() {
    var key, val, _ref, _results;
    response.status = xhr.status;
    response.statusText = xhr.statusText;
    _ref = convertHeaders(xhr.getAllResponseHeaders());
    _results = [];
    for (key in _ref) {
      val = _ref[key];
      if (!response.headers[key]) {
        _results.push(response.headers[key] = val);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  readBody = function() {
    response.type = xhr.responseType;
    response.text = xhr.responseText;
    response.data = xhr.response || response.text;
    return response.xml = xhr.responseXML;
  };
  currentState = 0;
  setReadyState = function(n) {
    var checkReadyState, hooks, process;
    extractProps();
    checkReadyState = function() {
      while (n > currentState && currentState < 4) {
        facade[READY_STATE] = ++currentState;
        console.log('READY STATE', facade[READY_STATE]);
        if (currentState === 2) {
          writeHead();
        }
        if (currentState === 4) {
          writeHead();
          writeBody();
        }
        facade[FIRE]("readystatechange", makeFakeEvent("readystatechange"));
        if (currentState === 4) {
          facade[FIRE]("load", makeFakeEvent("load"));
          facade[FIRE]("loadend", makeFakeEvent("loadend"));
        }
      }
    };
    if (n < 4) {
      checkReadyState();
      return;
    }
    hooks = xhook.listeners(AFTER);
    process = function() {
      var hook;
      if (!hooks.length) {
        return checkReadyState();
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
  makeFakeEvent = function(type) {
    var msieEventObject;
    if (document.createEventObject != null) {
      msieEventObject = document.createEventObject();
      msieEventObject.type = type;
      return msieEventObject;
    } else {
      try {
        return new Event(type);
      } catch (_error) {
        return {
          type: type
        };
      }
    }
  };
  checkEvent = function(e) {
    var clone, key, val;
    clone = {};
    for (key in e) {
      val = e[key];
      clone[key] = val === xhr ? facade : val;
    }
    return clone;
  };
  extractedProps = {};
  extractProps = function() {
    var event, fn, key, _i, _len, _ref;
    console.log('extract props...');
    _ref = ['timeout'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (xhr[key] && request[key] === undefined) {
        request[key] = xhr[key];
      }
    }
    for (key in facade) {
      fn = facade[key];
      if (!extractedProps[key] && typeof fn === 'function' && /^on(\w+)/.test(key)) {
        event = RegExp.$1;
        console.log('LISTEN FOR EVENT', event);
        facade[ON](event, fn);
        extractedProps[key] = 1;
      }
    }
  };
  xhr.onreadystatechange = function(event) {
    try {
      if (xhr[READY_STATE] === 2) {
        readHead();
        setReadyState(2);
      }
    } catch (_error) {}
    if (xhr[READY_STATE] === 4) {
      transiting = false;
      readHead();
      readBody();
      setReadyState(4);
    }
  };
  facade = EventEmitter();
  facade.withCredentials = false;
  facade.response = null;
  facade.status = 0;
  facade.open = function(method, url, async) {
    request.method = method;
    request.url = url;
    setReadyState(1);
  };
  facade.send = function(body) {
    var hooks, process, send;
    extractProps();
    request.body = body;
    send = function() {
      var header, value, _ref;
      response = {
        headers: {}
      };
      transiting = true;
      xhr.open(request.method, request.url);
      if (request.timeout) {
        xhr.timeout = request.timeout;
      }
      _ref = request.headers;
      for (header in _ref) {
        value = _ref[header];
        xhr.setRequestHeader(header, value);
      }
      xhr.send(request.body);
    };
    hooks = xhook.listeners(BEFORE);
    process = function() {
      var done, hook;
      if (!hooks.length) {
        return send();
      }
      done = function(resp) {
        if (typeof resp === 'object' && typeof resp.status === 'number') {
          response = resp;
          setReadyState(4);
          return;
        }
        process();
      };
      hook = hooks.shift();
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
  facade.abort = function() {
    if (transiting) {
      xhr.abort();
    }
    facade[FIRE]('abort', arguments);
  };
  facade.setRequestHeader = function(header, value) {
    request.headers[header] = value;
  };
  facade.getResponseHeader = function(header) {
    return response.headers[header];
  };
  facade.getAllResponseHeaders = function() {
    return convertHeaders(response.headers);
  };
  if (xhr.overrideMimeType) {
    facade.overrideMimeType = function() {
      return xhr.overrideMimeType.apply(xhr, arguments);
    };
  }
  return facade;
};

window.xhook = xhook;
}(this));