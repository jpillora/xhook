let WINDOW = null;

if (typeof WorkerGlobalScope !== 'undefined' && this instanceof WorkerGlobalScope) {
  WINDOW = this;
} else if (typeof global !== 'undefined') {
  WINDOW = global;
} else {
  WINDOW = window;
}

//for compression
document = WINDOW.document;
const BEFORE = 'before';
const AFTER = 'after';
const READY_STATE = 'readyState';
const ON = 'addEventListener';
const OFF = 'removeEventListener';
const FIRE = 'dispatchEvent';
const XMLHTTP = 'XMLHttpRequest';
const FETCH = 'fetch';
const FormData = 'FormData';

const UPLOAD_EVENTS = ['load', 'loadend', 'loadstart'];
const COMMON_EVENTS = ['progress', 'abort', 'error', 'timeout'];

//parse IE version
const useragent = typeof navigator !== 'undefined' && navigator['useragent'] ? navigator.userAgent : '';
let msie = parseInt((/msie (\d+)/.exec((useragent).toLowerCase()) || [])[1]);

if (isNaN(msie)) {
  msie = parseInt((/trident\/.*; rv:(\d+)/.exec((useragent).toLowerCase()) || [])[1]);
}

//if required, add 'indexOf' method to Array
Array.prototype.indexOf = Array.prototype.indexOf || function (item) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === item) {
        return i;
      }
    }

    return -1;
  };

const slice = (o, n) => Array.prototype.slice.call(o, n);

function depricatedProp(p) {
  return ["returnValue", "totalSize", "position"].indexOf(p) !== -1;
}

function mergeObjects(src, dst) {
  Object.keys(src).forEach((key) => {
    if (depricatedProp(key)) {
      return;
    }

    try {
      dst[key] = src[key]
    } catch (e) {}
  });

  return dst;
}

//proxy events from one emitter to another
function proxyEvents(events, src, dst) {
  function p(event) {
    return function (e){
      const clone = {};

      //copies event, with dst emitter inplace of src
      Object.keys(e).forEach((key) => {
        if (depricatedProp(key)) {
          return;
        }

        const val = e[key];
        clone[key] = val === src ? dst : val;
      });

      //emits out the dst
      dst[FIRE](event, clone);
    }
  }

  //dont proxy manual events
  events.forEach((event) => {
    if (dst._has(event)) {
      src[`on${event}`] = p(event);
    }
  });
}

//create fake event
function fakeEvent(type) {
  if (document && document.createEventObject) {
    const msieEventObject = document.createEventObject();
    msieEventObject.type = type;
    return msieEventObject;
  } else {
    // on some platforms like android 4.1.2 and safari on windows, it appears
    // that new Event is not allowed
    try {
      return new Event(type)
    } catch (e) {
      return type;
    }
  }
};

//tiny event emitter
function EventEmitter(nodeStyle) {
  //private
  let events = {};
  const listeners = (event) => events[event] || [];

  //public
  const emitter = {};

  emitter[ON] = function(event, callback, i) {
    events[event] = listeners(event);

    if (events[event].indexOf(callback) >= 0) {
      return;
    }

    i = i === undefined ? events[event].length : i;
    events[event].splice(i, 0, callback);
  };

  emitter[OFF] = function(event, callback) {
    //remove all
    if (event === undefined) {
      events = {};
      return;
    }

    //remove all of type event
    if (callback === undefined) {
      events[event] = [];
    }

    //remove particular handler
    const i = listeners(event).indexOf(callback);
    if (i === -1) {
      return;
    }

    listeners(event).splice(i, 1);
  };

  emitter[FIRE] = function() {
    const args = slice(arguments);
    const event = args.shift();

    if (!nodeStyle) {
      args[0] = mergeObjects(args[0], fakeEvent(event));
    }

    const legacylistener = emitter[`on${event}`];

    if (legacylistener) {
      legacylistener.apply(emitter, args);
    }

    listeners(event).concat(listeners("*")).forEach((listener) => listener.apply(emitter, args));
  };

  emitter._has = function (event) {
    return !!(events[event] || emitter[`on${event}`]);
  };

  //add extra aliases
  if (nodeStyle) {
    emitter.listeners = (event) => slice(listeners(event));
    emitter.on = emitter[ON];
    emitter.off = emitter[OFF];
    emitter.fire = emitter[FIRE];
    emitter.once = (e, fn) => {
      const fire = () => {
        emitter.off(e, fire);
        fn.apply(null, arguments);
      };

      emitter.on(e, fire);
    };
    emitter.destroy = () => events = {};
  }

  return emitter;
}

//use event emitter to store hooks
var xhook = EventEmitter(true);

xhook.EventEmitter = EventEmitter;

xhook[BEFORE] = function (handler, i) {
  if (handler.length < 1 || handler.length > 2) {
    throw "invalid hook";
  }

  xhook[ON](BEFORE, handler, i);
};

xhook[AFTER] = function (handler, i) {
  if (handler.length < 2 || handler.length > 3) {
    throw "invalid hook";
  }

  xhook[ON](AFTER, handler, i);
};

xhook.enable = function () {
  WINDOW[XMLHTTP] = XHookHttpRequest;

  if (typeof XHookFetchRequest === "function") {
    WINDOW[FETCH] = XHookFetchRequest;
  }

  if (NativeFormData) {
    WINDOW[FormData] = XHookFormData;
  }
};

xhook.disable = function () {
  WINDOW[XMLHTTP] = xhook[XMLHTTP];
  WINDOW[FETCH] = xhook[FETCH];

  if (NativeFormData) {
    WINDOW[FormData] = NativeFormData;
  }
};

//helper
const convertHeaders = xhook.headers = function(h, dest = {}) {
  switch (typeof h) {
    case "object": {
      const headers = [];

      Object.keys(h).forEach((key) => {
        const name = key.toLowerCase();
        headers.push(`${name}:\t${h[key]}`);
      });

      return headers.join('\n');
    }

    case "string": {
      const headers = h.split('\n');

      headers.forEach((header) => {
        if (/([^:]+):\s*(.+)/.test(header)) {
          const name = RegExp.$1 ? RegExp.$1.toLowerCase() : undefined;
          const value = RegExp.$2;
          dest[name] = dest[name] || value;
        }
      });

      return dest;
    }
  }
};

//patch FormData
// we can do this safely because all XHR
// is hooked, so we can ensure the real FormData
// object is used on send
NativeFormData = WINDOW[FormData];
function XHookFormData(form) {
  this.fd = form ? new NativeFormData(form) : new NativeFormData();
  this.form = form;
  const entries = [];

  Object.defineProperty(this, 'entries', {
    get: () => {
      let fentries;

      //extract form entries
      if (!form) {
        fentries = [];
      } else {
        fentries = slice(form.querySelectorAll("input,select"))
          .filter((e) => ['checkbox', 'radio'].indexOf(e.type) === -1 || e.checked)
          .map((e) => [e.name, e.type === "file" ? e.files : e.value]);
      }

      //combine with js entries
      return fentries.concat(entries);
    }
  });

  this.append = () => {
    const args = slice(arguments);
    entries.push(args);
    this.fd.append.apply(this.fd, args);
  }
};

if (NativeFormData) {
  //expose native formdata as xhook.FormData incase its needed
  xhook[FormData] = NativeFormData;
  WINDOW[FormData] = XHookFormData;
}

//patch XHR
NativeXMLHttp = WINDOW[XMLHTTP];
xhook[XMLHTTP] = NativeXMLHttp;
WINDOW[XMLHTTP] = XHookHttpRequest;

function XHookHttpRequest() {
  const ABORTED = -1;
  const xhr = new xhook[XMLHTTP]();

  //==============================
  // Extra state
  const request = {};
  let status = null;
  let hasError = undefined;
  let transiting = undefined;
  let response = undefined;

  //==============================
  // Private API

  //read results from real xhr into response
  function readHead() {
    // Accessing attributes on an aborted xhr object will
    // throw an 'c00c023f error' in IE9 and lower, don't touch it.
    response.status = status || xhr.status;

    if (!(status === ABORTED && msie < 10)) {
      response.statusText = xhr.statusText;
    }

    if (status !== ABORTED) {
      const headers = convertHeaders(xhr.getAllResponseHeaders());

      Object.keys(headers).forEach((key) => {
        if (!response.headers[key]) {
          const name = key.toLowerCase();
          response.headers[name] = headers[key];
        }
      });
    }
  }

  function readBody() {
    //https://xhr.spec.whatwg.org/
    if (!xhr.responseType || xhr.responseType === "text") {
      response.text = xhr.responseText;
      response.data = xhr.responseText;
    } else if (xhr.responseType === "document") {
      response.xml = xhr.responseXML;
      response.data = xhr.responseXML;
    } else {
      response.data = xhr.response;
    }

    //new in some browsers
    if (xhr.responseURL) {
      response.finalUrl = xhr.responseURL;
    }
  }

  //write response into facade xhr
  function writeHead() {
    facade.status = response.status;
    facade.statusText = response.statusText;
  }

  function writeBody() {
    if (response.text) {
      facade.responseText = response.text;
    }

    if (response.xml) {
      facade.responseXML = response.xml;
    }

    if (response.data) {
      facade.response = response.data;
    }

    if (response.finalUrl) {
      facade.responseURL = response.finalUrl;
    }
  }

  //ensure ready state 0 through 4 is handled
  function emitReadyState(n) {
    while (n > currentState && currentState < 4) {
      facade[READY_STATE] = ++currentState;
      // make fake events for libraries that actually check the type on
      // the event object
      if (currentState === 1) {
        facade[FIRE]("loadstart", {});
      }

      if (currentState === 2) {
        writeHead();
      }

      if (currentState === 4) {
        writeHead();
        writeBody();
      }

      facade[FIRE]("readystatechange", {});
      //delay final events incase of error

      if (currentState === 4) {
        setTimeout(emitFinal, 0);
      }
    }
  }

  function emitFinal() {
    if (!hasError) {
      facade[FIRE]("load", {});
    }

    facade[FIRE]("loadend", {});

    if (hasError) {
      facade[READY_STATE] = 0;
    }
  }

  //control facade ready state
  let currentState = 0;

  function setReadyState(n) {
    //emit events until readyState reaches 4
    if (n !== 4) {
      emitReadyState(n);
      return;
    }

    //before emitting 4, run all 'after' hooks in sequence
    const hooks = xhook.listeners(AFTER);
    function process() {
      if (!hooks.length) {
        return emitReadyState(4);
      }

      const hook = hooks.shift();
      if (hook.length === 2) {
        hook(request, response);
        process();
      } else if (hook.length === 3 && request.async) {
        hook(request, response, process);
      } else {
        process();
      }
    }

    process();
  }

  //==============================
  // Facade XHR
  const facade = request.xhr = EventEmitter();

  //==============================

  facade.response = xhr.response;
  facade.responseText = xhr.responseText;
  facade.responseXML = xhr.responseXML;
  facade.responseURL = xhr.responseURL;
  facade.readyState = xhr.readyState;
  facade.status = xhr.status;
  facade.statusText = xhr.statusText;

  // Handle the underlying ready state
  xhr.onreadystatechange = function (event) {
    //pull status and headers
    try {
      if (xhr[READY_STATE] === 2) {
        readHead();
      }
    } catch (e) {}

    //pull response data
    if (xhr[READY_STATE] === 4) {
      transiting = false;
      readHead();
      readBody();
    }

    setReadyState(xhr[READY_STATE]);
  };

  //mark this xhr as errored
  function hasErrorHandler() {
    hasError = true;
  }

  facade[ON]('error', hasErrorHandler);
  facade[ON]('timeout', hasErrorHandler);
  facade[ON]('abort', hasErrorHandler);

  // progress means we're current downloading...
  facade[ON]('progress', () => {
    //progress events are followed by readystatechange for some reason...
    if (currentState < 3) {
      setReadyState(3);
    } else {
      facade[FIRE]("readystatechange", {}); //TODO fake an XHR event
    }
  });

  // initialise 'withCredentials' on facade xhr in browsers with it
  // or if explicitly told to do so
  if ((xhr || xhook.addWithCredentials).withCredentials) {
    facade.withCredentials = false;
  }

  facade.status = 0;

  // initialise all possible event handlers
  COMMON_EVENTS.concat(UPLOAD_EVENTS).forEach((event) => {
    facade[`on${event}`] = null;
  });

  facade.open = function (method, url, async, user, pass) {
    // Initailize empty XHR facade
    currentState = 0;
    hasError = false;
    transiting = false;
    request.headers = {};
    request.headerNames = {};
    request.status = 0;
    response = {};
    response.headers = {};

    request.method = method;
    request.url = url;
    request.async = async !== false;
    request.user = user;
    request.pass = pass;

    // opened facade xhr (not real xhr)
    setReadyState(1);
  };

  facade.send = function (body) {
    //read xhr settings before hooking
    ['type', 'timeout', 'withCredentials'].forEach((key) => {
      const modk = key === "type" ? "responseType" : key;

      if (facade[modk]) {
        request[key] = facade[modk];
      }
    });

    request.body = body;

    function send() {
      //proxy all events from real xhr to facade
      proxyEvents(COMMON_EVENTS, xhr, facade);
      proxyEvents(COMMON_EVENTS.concat(UPLOAD_EVENTS), xhr.upload, facade.upload ? facade.upload : undefined);

      //prepare request all at once
      transiting = true;

      //perform open
      xhr.open(request.method, request.url, request.async, request.user, request.pass);

      //write xhr settings
      ['type', 'timeout', 'withCredentials'].forEach((key) => {
        const modk = key === "type" ? "responseType" : key;

        if (request[key]) {
          xhr[modk] = request[key];
        }
      });

      //insert headers
      Object.keys(request.headers).forEach((key) => {
        xhr.setRequestHeader(key, request.headers[key]);
      });

      //extract real formdata
      if (request.body instanceof XHookFormData) {
        request.body = request.body.fd;
      }

      //real send!
      xhr.send(request.body);
    }

    const hooks = xhook.listeners(BEFORE);

    //process hooks sequentially
    function process() {
      if (!hooks.length) {
        return send();
      }

      //go to next hook OR optionally provide response
      function done(userResponse) {
        //break chain - provide dummy response (readyState 4)
        if (typeof userResponse === 'object' &&
          (typeof userResponse.status === 'number' ||
          typeof response.status === 'number')) {
          mergeObjects(userResponse, response);

          if (!('data' in userResponse)) {
            userResponse.data = userResponse.response || userResponse.text;
          }

          setReadyState(4);
          return;
        }
        //continue processing until no hooks left
        process();
      }

      //specifically provide headers (readyState 2)
      done.head = function(userResponse) {
        mergeObjects(userResponse, response);
        setReadyState(2);
      };

      //specifically provide partial text (responseText  readyState 3)
      done.progress = function(userResponse) {
        mergeObjects(userResponse, response);
        setReadyState(3);
      };

      const hook = hooks.shift();

      //async or sync?
      if (hook.length === 1) {
        done(hook(request));
      } else if (hook.length === 2 && request.async) {
        //async handlers must use an async xhr
        hook(request, done);
      } else {
        //skip async hook on sync requests
        done();
      }
    }

    //kick off
    process();
  };

  facade.abort = function () {
    status = ABORTED;

    if (transiting) {
      xhr.abort(); //this will emit an 'abort' for us
    } else {
      facade[FIRE]('abort', {});
    }
  };

  facade.setRequestHeader = function (header, value) {
    //the first header set is used for all future case-alternatives of 'name'
    const lName = header ? header.toLowerCase() : undefined;
    const name = request.headerNames[lName] = request.headerNames[lName] || header;

    //append header to any previous values
    if (request.headers[name]) {
      value = request.headers[name] + ', ' + value;
    }

    request.headers[name] = value;
  };

  facade.getResponseHeader = function(header) {
    const name = header ? header.toLowerCase() : undefined;
    return response.headers[name];
  };

  facade.getAllResponseHeaders = function() {
    convertHeaders(response.headers);
  };

  //proxy call only when supported
  if (xhr.overrideMimeType) {
    facade.overrideMimeType = () => xhr.overrideMimeType.apply(xhr, arguments);
  }

  //create emitter when supported
  if (xhr.upload) {
    facade.upload = request.upload = EventEmitter();
  }

  facade.UNSENT = 0;
  facade.OPENED = 1;
  facade.HEADERS_RECEIVED = 2;
  facade.LOADING = 3;
  facade.DONE = 4;
  return facade;
}

//patch Fetch
if (typeof WINDOW[FETCH] === "function") {
  const NativeFetch = WINDOW[FETCH];
  xhook[FETCH] = NativeFetch;
  WINDOW[FETCH] = XHookFetchRequest;

  function XHookFetchRequest(url, options = { headers: {} }) {
    options.url = url;
    let request = null;

    const beforeHooks = xhook.listeners(BEFORE);
    const afterHooks = xhook.listeners(AFTER);

    return new Promise((resolve, reject) => {

      function getRequest() {
        if (options.headers) {
          options.headers = new Headers(options.headers);
        }

        if (!request) {
          request = new Request(options.url, options);
        }

        return mergeObjects(options, request);
      }

      function processAfter(response) {
        if (!afterHooks.length) {
          return resolve(response);
        }

        const hook = afterHooks.shift();

        if (hook.length === 2) {
          hook(getRequest(), response);
          processAfter(response);
        } else if (hook.length === 3) {
          hook(getRequest(), response, processAfter);
        } else {
          processAfter(response);
        }
      }

      function done(userResponse) {
        if (userResponse !== undefined) {
          const response = new Response(userResponse.body || userResponse.text, userResponse);
          resolve(response);
          processAfter(response);
          return;
        }

        //continue processing until no hooks left
        processBefore();
      }

      function processBefore() {
        if (!beforeHooks.length) {
          send();
          return;
        }

        const hook = beforeHooks.shift();

        if (hook.length === 1) {
          done(hook(options));
        } else if (hook.length === 2) {
          hook(getRequest(), done);
        }
      }

      function send() {
        NativeFetch(getRequest())
          .then((response) => processAfter(response))
          .catch((err) => {
            processAfter(err);
            reject(err);
          });
      }

      processBefore();
    });
  }
}

XHookHttpRequest.UNSENT = 0;
XHookHttpRequest.OPENED = 1;
XHookHttpRequest.HEADERS_RECEIVED = 2;
XHookHttpRequest.LOADING = 3;
XHookHttpRequest.DONE = 4;

//publicise (amd+commonjs+window)
if (typeof define === "function" && define.amd) {
  define("xhook", [], () => xhook);
} else {
  (this.exports || this).xhook = xhook;
}
