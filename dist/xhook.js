//XHook - v1.6.2 - https://github.com/jpillora/xhook
//Jaime Pillora <dev@jpillora.com> - MIT Copyright 2023
var xhook = (function () {
  'use strict';

  const slice = (o, n) => Array.prototype.slice.call(o, n);

  let result = null;

  //find global object
  if (
    typeof WorkerGlobalScope !== "undefined" &&
    self instanceof WorkerGlobalScope
  ) {
    result = self;
  } else if (typeof global !== "undefined") {
    result = global;
  } else if (window) {
    result = window;
  }

  const windowRef = result;
  const documentRef = result.document;

  const UPLOAD_EVENTS = ["load", "loadend", "loadstart"];
  const COMMON_EVENTS = ["progress", "abort", "error", "timeout"];

  const depricatedProp = p =>
    ["returnValue", "totalSize", "position"].includes(p);

  const mergeObjects = function (src, dst) {
    for (let k in src) {
      if (depricatedProp(k)) {
        continue;
      }
      const v = src[k];
      try {
        dst[k] = v;
      } catch (error) {}
    }
    return dst;
  };

  //proxy events from one emitter to another
  const proxyEvents = function (events, src, dst) {
    const p = event =>
      function (e) {
        const clone = {};
        //copies event, with dst emitter inplace of src
        for (let k in e) {
          if (depricatedProp(k)) {
            continue;
          }
          const val = e[k];
          clone[k] = val === src ? dst : val;
        }
        //emits out the dst
        return dst.dispatchEvent(event, clone);
      };
    //dont proxy manual events
    for (let event of Array.from(events)) {
      if (dst._has(event)) {
        src[`on${event}`] = p(event);
      }
    }
  };

  //create fake event
  const fakeEvent = function (type) {
    if (documentRef && documentRef.createEventObject != null) {
      const msieEventObject = documentRef.createEventObject();
      msieEventObject.type = type;
      return msieEventObject;
    }
    // on some platforms like android 4.1.2 and safari on windows, it appears
    // that new Event is not allowed
    try {
      return new Event(type);
    } catch (error) {
      return { type };
    }
  };

  //tiny event emitter
  const EventEmitter = function (nodeStyle) {
    //private
    let events = {};
    const listeners = event => events[event] || [];
    //public
    const emitter = {};
    emitter.addEventListener = function (event, callback, i) {
      events[event] = listeners(event);
      if (events[event].indexOf(callback) >= 0) {
        return;
      }
      i = i === undefined ? events[event].length : i;
      events[event].splice(i, 0, callback);
    };
    emitter.removeEventListener = function (event, callback) {
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
    emitter.dispatchEvent = function () {
      const args = slice(arguments);
      const event = args.shift();
      if (!nodeStyle) {
        args[0] = mergeObjects(args[0], fakeEvent(event));
        Object.defineProperty(args[0], "target", {
          writable: false,
          value: this,
        });
      }
      const legacylistener = emitter[`on${event}`];
      if (legacylistener) {
        legacylistener.apply(emitter, args);
      }
      const iterable = listeners(event).concat(listeners("*"));
      for (let i = 0; i < iterable.length; i++) {
        const listener = iterable[i];
        listener.apply(emitter, args);
      }
    };
    emitter._has = event => !!(events[event] || emitter[`on${event}`]);
    //add extra aliases
    if (nodeStyle) {
      emitter.listeners = event => slice(listeners(event));
      emitter.on = emitter.addEventListener;
      emitter.off = emitter.removeEventListener;
      emitter.fire = emitter.dispatchEvent;
      emitter.once = function (e, fn) {
        var fire = function () {
          emitter.off(e, fire);
          return fn.apply(null, arguments);
        };
        return emitter.on(e, fire);
      };
      emitter.destroy = () => (events = {});
    }

    return emitter;
  };

  //helper
  const CRLF = "\r\n";

  const objectToString = function (headersObj) {
    const entries = Object.entries(headersObj);

    const headers = entries.map(([name, value]) => {
      return `${name.toLowerCase()}: ${value}`;
    });

    return headers.join(CRLF);
  };

  const stringToObject = function (headersString, dest) {
    const headers = headersString.split(CRLF);
    if (dest == null) {
      dest = {};
    }

    for (let header of headers) {
      if (/([^:]+):\s*(.+)/.test(header)) {
        const name = RegExp.$1 != null ? RegExp.$1.toLowerCase() : undefined;
        const value = RegExp.$2;
        if (dest[name] == null) {
          dest[name] = value;
        }
      }
    }

    return dest;
  };

  const convert = function (headers, dest) {
    switch (typeof headers) {
      case "object": {
        return objectToString(headers);
      }
      case "string": {
        return stringToObject(headers, dest);
      }
    }

    return [];
  };

  var headers = { convert };

  //global set of hook functions,
  //uses event emitter to store hooks
  const hooks = EventEmitter(true);

  const nullify = res => (res === undefined ? null : res);

  //browser's XMLHttpRequest
  const Native$1 = windowRef.XMLHttpRequest;

  //xhook's XMLHttpRequest
  const Xhook$1 = function () {
    const ABORTED = -1;
    const xhr = new Native$1();

    //==========================
    // Extra state
    const request = {};
    let status = null;
    let hasError = undefined;
    let transiting = undefined;
    let response = undefined;
    var currentState = 0;

    //==========================
    // Private API

    //read results from real xhr into response
    const readHead = function () {
      // Accessing attributes on an aborted xhr object will
      // throw an 'c00c023f error' in IE9 and lower, don't touch it.
      response.status = status || xhr.status;
      if (status !== ABORTED) {
        response.statusText = xhr.statusText;
      }
      if (status !== ABORTED) {
        const object = headers.convert(xhr.getAllResponseHeaders());
        for (let key in object) {
          const val = object[key];
          if (!response.headers[key]) {
            const name = key.toLowerCase();
            response.headers[name] = val;
          }
        }
        return;
      }
    };

    const readBody = function () {
      //https://xhr.spec.whatwg.org/
      if (!xhr.responseType || xhr.responseType === "text") {
        response.text = xhr.responseText;
        response.data = xhr.responseText;
        try {
          response.xml = xhr.responseXML;
        } catch (error) {}
        // unable to set responseXML due to response type, we attempt to assign responseXML
        // when the type is text even though it's against the spec due to several libraries
        // and browser vendors who allow this behavior. causing these requests to fail when
        // xhook is installed on a page.
      } else if (xhr.responseType === "document") {
        response.xml = xhr.responseXML;
        response.data = xhr.responseXML;
      } else {
        response.data = xhr.response;
      }
      //new in some browsers
      if ("responseURL" in xhr) {
        response.finalUrl = xhr.responseURL;
      }
    };

    //write response into facade xhr
    const writeHead = function () {
      facade.status = response.status;
      facade.statusText = response.statusText;
    };

    const writeBody = function () {
      if ("text" in response) {
        facade.responseText = response.text;
      }
      if ("xml" in response) {
        facade.responseXML = response.xml;
      }
      if ("data" in response) {
        facade.response = response.data;
      }
      if ("finalUrl" in response) {
        facade.responseURL = response.finalUrl;
      }
    };

    const emitFinal = function () {
      if (!hasError) {
        facade.dispatchEvent("load", {});
      }
      facade.dispatchEvent("loadend", {});
      if (hasError) {
        facade.readyState = 0;
      }
    };

    //ensure ready state 0 through 4 is handled
    const emitReadyState = function (n) {
      while (n > currentState && currentState < 4) {
        facade.readyState = ++currentState;
        // make fake events for libraries that actually check the type on
        // the event object
        if (currentState === 1) {
          facade.dispatchEvent("loadstart", {});
        }
        if (currentState === 2) {
          writeHead();
        }
        if (currentState === 4) {
          writeHead();
          writeBody();
        }
        facade.dispatchEvent("readystatechange", {});
        //delay final events incase of error
        if (currentState === 4) {
          if (request.async === false) {
            emitFinal();
          } else {
            setTimeout(emitFinal, 0);
          }
        }
      }
    };

    //control facade ready state
    const setReadyState = function (n) {
      //emit events until readyState reaches 4
      if (n !== 4) {
        emitReadyState(n);
        return;
      }
      //before emitting 4, run all 'after' hooks in sequence
      const afterHooks = hooks.listeners("after");
      var process = function () {
        if (afterHooks.length > 0) {
          //execute each 'before' hook one at a time
          const hook = afterHooks.shift();
          if (hook.length === 2) {
            hook(request, response);
            process();
          } else if (hook.length === 3 && request.async) {
            hook(request, response, process);
          } else {
            process();
          }
        } else {
          //response ready for reading
          emitReadyState(4);
        }
        return;
      };
      process();
    };

    //==========================
    // Facade XHR
    var facade = EventEmitter();
    request.xhr = facade;

    // Handle the underlying ready state
    xhr.onreadystatechange = function (event) {
      //pull status and headers
      try {
        if (xhr.readyState === 2) {
          readHead();
        }
      } catch (error) {}
      //pull response data
      if (xhr.readyState === 4) {
        transiting = false;
        readHead();
        readBody();
      }

      setReadyState(xhr.readyState);
    };

    //mark this xhr as errored
    const hasErrorHandler = function () {
      hasError = true;
    };
    facade.addEventListener("error", hasErrorHandler);
    facade.addEventListener("timeout", hasErrorHandler);
    facade.addEventListener("abort", hasErrorHandler);
    // progress means we're current downloading...
    facade.addEventListener("progress", function (event) {
      if (currentState < 3) {
        setReadyState(3);
      } else if (xhr.readyState <= 3) {
        //until ready (4), each progress event is followed by readystatechange...
        facade.dispatchEvent("readystatechange", {}); //TODO fake an XHR event
      }
    });

    // initialise 'withCredentials' on facade xhr in browsers with it
    // or if explicitly told to do so
    if ("withCredentials" in xhr) {
      facade.withCredentials = false;
    }
    facade.status = 0;

    // initialise all possible event handlers
    for (let event of Array.from(COMMON_EVENTS.concat(UPLOAD_EVENTS))) {
      facade[`on${event}`] = null;
    }

    facade.open = function (method, url, async, user, pass) {
      // Initailize empty XHR facade
      currentState = 0;
      hasError = false;
      transiting = false;
      //reset request
      request.headers = {};
      request.headerNames = {};
      request.status = 0;
      request.method = method;
      request.url = url;
      request.async = async !== false;
      request.user = user;
      request.pass = pass;
      //reset response
      response = {};
      response.headers = {};
      // openned facade xhr (not real xhr)
      setReadyState(1);
    };

    facade.send = function (body) {
      //read xhr settings before hooking
      let k, modk;
      for (k of ["type", "timeout", "withCredentials"]) {
        modk = k === "type" ? "responseType" : k;
        if (modk in facade) {
          request[k] = facade[modk];
        }
      }

      request.body = body;
      const send = function () {
        //proxy all events from real xhr to facade
        proxyEvents(COMMON_EVENTS, xhr, facade);
        //proxy all upload events from the real to the upload facade
        if (facade.upload) {
          proxyEvents(
            COMMON_EVENTS.concat(UPLOAD_EVENTS),
            xhr.upload,
            facade.upload
          );
        }

        //prepare request all at once
        transiting = true;
        //perform open
        xhr.open(
          request.method,
          request.url,
          request.async,
          request.user,
          request.pass
        );

        //write xhr settings
        for (k of ["type", "timeout", "withCredentials"]) {
          modk = k === "type" ? "responseType" : k;
          if (k in request) {
            xhr[modk] = request[k];
          }
        }

        //insert headers
        for (let header in request.headers) {
          const value = request.headers[header];
          if (header) {
            xhr.setRequestHeader(header, value);
          }
        }
        //real send!
        xhr.send(request.body);
      };

      const beforeHooks = hooks.listeners("before");
      //process beforeHooks sequentially
      var process = function () {
        if (!beforeHooks.length) {
          return send();
        }
        //go to next hook OR optionally provide response
        const done = function (userResponse) {
          //break chain - provide dummy response (readyState 4)
          if (
            typeof userResponse === "object" &&
            (typeof userResponse.status === "number" ||
              typeof response.status === "number")
          ) {
            mergeObjects(userResponse, response);
            if (!("data" in userResponse)) {
              userResponse.data = userResponse.response || userResponse.text;
            }
            setReadyState(4);
            return;
          }
          //continue processing until no beforeHooks left
          process();
        };
        //specifically provide headers (readyState 2)
        done.head = function (userResponse) {
          mergeObjects(userResponse, response);
          setReadyState(2);
        };
        //specifically provide partial text (responseText  readyState 3)
        done.progress = function (userResponse) {
          mergeObjects(userResponse, response);
          setReadyState(3);
        };

        const hook = beforeHooks.shift();
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
        return;
      };
      //kick off
      process();
    };

    facade.abort = function () {
      status = ABORTED;
      if (transiting) {
        xhr.abort(); //this will emit an 'abort' for us
      } else {
        facade.dispatchEvent("abort", {});
      }
    };

    facade.setRequestHeader = function (header, value) {
      //the first header set is used for all future case-alternatives of 'name'
      const lName = header != null ? header.toLowerCase() : undefined;
      const name = (request.headerNames[lName] =
        request.headerNames[lName] || header);
      //append header to any previous values
      if (request.headers[name]) {
        value = request.headers[name] + ", " + value;
      }
      request.headers[name] = value;
    };
    facade.getResponseHeader = header =>
      nullify(response.headers[header ? header.toLowerCase() : undefined]);

    facade.getAllResponseHeaders = () =>
      nullify(headers.convert(response.headers));

    //proxy call only when supported
    if (xhr.overrideMimeType) {
      facade.overrideMimeType = function () {
        xhr.overrideMimeType.apply(xhr, arguments);
      };
    }

    //create emitter when supported
    if (xhr.upload) {
      let up = EventEmitter();
      facade.upload = up;
      request.upload = up;
    }

    facade.UNSENT = 0;
    facade.OPENED = 1;
    facade.HEADERS_RECEIVED = 2;
    facade.LOADING = 3;
    facade.DONE = 4;

    // fill in default values for an empty XHR object according to the spec
    facade.response = "";
    facade.responseText = "";
    facade.responseXML = null;
    facade.readyState = 0;
    facade.statusText = "";

    return facade;
  };

  Xhook$1.UNSENT = 0;
  Xhook$1.OPENED = 1;
  Xhook$1.HEADERS_RECEIVED = 2;
  Xhook$1.LOADING = 3;
  Xhook$1.DONE = 4;

  //patch interface
  var XMLHttpRequest = {
    patch() {
      if (Native$1) {
        windowRef.XMLHttpRequest = Xhook$1;
      }
    },
    unpatch() {
      if (Native$1) {
        windowRef.XMLHttpRequest = Native$1;
      }
    },
    Native: Native$1,
    Xhook: Xhook$1,
  };

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  //browser's fetch
  const Native = windowRef.fetch;
  function copyToObjFromRequest(req) {
      const copyedKeys = [
          "method",
          "headers",
          "body",
          "mode",
          "credentials",
          "cache",
          "redirect",
          "referrer",
          "referrerPolicy",
          "integrity",
          "keepalive",
          "signal",
          "url",
      ];
      let copyedObj = {};
      copyedKeys.forEach(key => (copyedObj[key] = req[key]));
      return copyedObj;
  }
  function covertHeaderToPlainObj(headers) {
      if (headers instanceof Headers) {
          return covertTDAarryToObj([...headers.entries()]);
      }
      if (Array.isArray(headers)) {
          return covertTDAarryToObj(headers);
      }
      return headers;
  }
  function covertTDAarryToObj(input) {
      return input.reduce((prev, [key, value]) => {
          prev[key] = value;
          return prev;
      }, {});
  }
  /**
   * if fetch(hacked by Xhook) accept a Request as a first parameter, it will be destrcuted to a plain object.
   * Finally the whole network request was convert to fectch(Request.url, other options)
   */
  const Xhook = function (input, init = { headers: {} }) {
      let options = Object.assign(Object.assign({}, init), { isFetch: true });
      if (input instanceof Request) {
          const requestObj = copyToObjFromRequest(input);
          const prevHeaders = Object.assign(Object.assign({}, covertHeaderToPlainObj(requestObj.headers)), covertHeaderToPlainObj(options.headers));
          options = Object.assign(Object.assign(Object.assign({}, requestObj), init), { headers: prevHeaders, acceptedRequest: true });
      }
      else {
          options.url = input;
      }
      const beforeHooks = hooks.listeners("before");
      const afterHooks = hooks.listeners("after");
      return new Promise(function (resolve, reject) {
          let fullfiled = resolve;
          const processAfter = function (response) {
              if (!afterHooks.length) {
                  return fullfiled(response);
              }
              const hook = afterHooks.shift();
              if (hook.length === 2) {
                  hook(options, response);
                  return processAfter(response);
              }
              else if (hook.length === 3) {
                  return hook(options, response, processAfter);
              }
              else {
                  return processAfter(response);
              }
          };
          const done = function (userResponse) {
              if (userResponse !== undefined) {
                  const response = new Response(userResponse.body || userResponse.text, userResponse);
                  resolve(response);
                  processAfter(response);
                  return;
              }
              //continue processing until no hooks left
              processBefore();
          };
          const processBefore = function () {
              if (!beforeHooks.length) {
                  send();
                  return;
              }
              const hook = beforeHooks.shift();
              if (hook.length === 1) {
                  return done(hook(options));
              }
              else if (hook.length === 2) {
                  return hook(options, done);
              }
          };
          const send = () => __awaiter(this, void 0, void 0, function* () {
              const { url, isFetch, acceptedRequest } = options, restInit = __rest(options, ["url", "isFetch", "acceptedRequest"]);
              if (input instanceof Request && restInit.body instanceof ReadableStream) {
                  restInit.body = yield new Response(restInit.body).text();
              }
              return Native(url, restInit)
                  .then(response => processAfter(response))
                  .catch(function (err) {
                  fullfiled = reject;
                  processAfter(err);
                  return reject(err);
              });
          });
          processBefore();
      });
  };
  //patch interface
  var fetch = {
      patch() {
          if (Native) {
              windowRef.fetch = Xhook;
          }
      },
      unpatch() {
          if (Native) {
              windowRef.fetch = Native;
          }
      },
      Native,
      Xhook,
  };

  //the global hooks event emitter is also the global xhook object
  //(not the best decision in hindsight)
  const xhook = hooks;
  xhook.EventEmitter = EventEmitter;
  //modify hooks
  xhook.before = function (handler, i) {
    if (handler.length < 1 || handler.length > 2) {
      throw "invalid hook";
    }
    return xhook.on("before", handler, i);
  };
  xhook.after = function (handler, i) {
    if (handler.length < 2 || handler.length > 3) {
      throw "invalid hook";
    }
    return xhook.on("after", handler, i);
  };

  //globally enable/disable
  xhook.enable = function () {
    XMLHttpRequest.patch();
    fetch.patch();
  };
  xhook.disable = function () {
    XMLHttpRequest.unpatch();
    fetch.unpatch();
  };
  //expose native objects
  xhook.XMLHttpRequest = XMLHttpRequest.Native;
  xhook.fetch = fetch.Native;

  //expose helpers
  xhook.headers = headers.convert;

  //enable by default
  xhook.enable();

  return xhook;

})();
//# sourceMappingURL=xhook.js.map
