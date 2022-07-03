/*!
 * XHook - v1.5.0 - https://github.com/jpillora/xhook
 * Jaime Pillora <dev@jpillora.com> - MIT Copyright 2022
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/amd-options.js":
/*!****************************************!*\
  !*** (webpack)/buildin/amd-options.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {/* globals __webpack_amd_options__ */
module.exports = __webpack_amd_options__;

/* WEBPACK VAR INJECTION */}.call(this, {}))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/*!*******************************************!*\
  !*** (webpack)/buildin/harmony-module.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if (!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _misc_event_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./misc/event-emitter */ "./src/misc/event-emitter.js");
/* harmony import */ var _misc_window__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./misc/window */ "./src/misc/window.js");
/* harmony import */ var _misc_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./misc/headers */ "./src/misc/headers.js");
/* harmony import */ var _patch_xmlhttprequest__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./patch/xmlhttprequest */ "./src/patch/xmlhttprequest.js");
/* harmony import */ var _patch_fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./patch/fetch */ "./src/patch/fetch.js");
/* harmony import */ var _patch_formdata__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./patch/formdata */ "./src/patch/formdata.js");
/* harmony import */ var _misc_hooks__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./misc/hooks */ "./src/misc/hooks.js");




//patchable types




//global state

//the global hooks event emitter is also the global xhook object
//(not the best decision in hindsight)
const xhook = _misc_hooks__WEBPACK_IMPORTED_MODULE_6__["default"];
xhook.EventEmitter = _misc_event_emitter__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"];
//modify hooks
xhook.before = function(handler, i) {
  if (handler.length < 1 || handler.length > 2) {
    throw "invalid hook";
  }
  return xhook.on("before", handler, i);
};
xhook.after = function(handler, i) {
  if (handler.length < 2 || handler.length > 3) {
    throw "invalid hook";
  }
  return xhook.on("after", handler, i);
};

//globally enable/disable
xhook.enable = function() {
  _patch_xmlhttprequest__WEBPACK_IMPORTED_MODULE_3__["default"].patch();
  _patch_fetch__WEBPACK_IMPORTED_MODULE_4__["default"].patch();
  _patch_formdata__WEBPACK_IMPORTED_MODULE_5__["default"].patch();
};
xhook.disable = function() {
  _patch_xmlhttprequest__WEBPACK_IMPORTED_MODULE_3__["default"].unpatch();
  _patch_fetch__WEBPACK_IMPORTED_MODULE_4__["default"].unpatch();
  _patch_formdata__WEBPACK_IMPORTED_MODULE_5__["default"].unpatch();
};
//expose native objects
xhook.XMLHttpRequest = _patch_xmlhttprequest__WEBPACK_IMPORTED_MODULE_3__["default"].Native;
xhook.fetch = _patch_fetch__WEBPACK_IMPORTED_MODULE_4__["default"].Native;
xhook.FormData = _patch_formdata__WEBPACK_IMPORTED_MODULE_5__["default"].Native;

//expose helpers
xhook.headers = _misc_headers__WEBPACK_IMPORTED_MODULE_2__["default"].convert;

//enable by default
xhook.enable();

//publicise (amd+commonjs+window)
if (typeof define === "function" && __webpack_require__(/*! !webpack amd options */ "./node_modules/webpack/buildin/amd-options.js")) {
  define("xhook", [], () => xhook);
} else if (module && typeof module === "object" && module.exports) {
  module.exports = { xhook };
} else if (_misc_window__WEBPACK_IMPORTED_MODULE_1__["window"]) {
  _misc_window__WEBPACK_IMPORTED_MODULE_1__["window"].xhook = xhook;
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ "./src/misc/array.js":
/*!***************************!*\
  !*** ./src/misc/array.js ***!
  \***************************/
/*! exports provided: slice */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slice", function() { return slice; });
//if required, add 'indexOf' method to Array
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(item) {
    for (let i = 0; i < this.length; i++) {
      const x = this[i];
      if (x === item) {
        return i;
      }
    }
    return -1;
  };
}

const slice = (o, n) => Array.prototype.slice.call(o, n);




/***/ }),

/***/ "./src/misc/event-emitter.js":
/*!***********************************!*\
  !*** ./src/misc/event-emitter.js ***!
  \***********************************/
/*! exports provided: EventEmitter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EventEmitter", function() { return EventEmitter; });
/* harmony import */ var _array__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./array */ "./src/misc/array.js");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events */ "./src/misc/events.js");



//tiny event emitter
const EventEmitter = function(nodeStyle) {
  //private
  let events = {};
  const listeners = event => events[event] || [];
  //public
  const emitter = {};
  emitter.addEventListener = function(event, callback, i) {
    events[event] = listeners(event);
    if (events[event].indexOf(callback) >= 0) {
      return;
    }
    i = i === undefined ? events[event].length : i;
    events[event].splice(i, 0, callback);
  };
  emitter.removeEventListener = function(event, callback) {
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
  emitter.dispatchEvent = function() {
    const args = Object(_array__WEBPACK_IMPORTED_MODULE_0__["slice"])(arguments);
    const event = args.shift();
    if (!nodeStyle) {
      args[0] = Object(_events__WEBPACK_IMPORTED_MODULE_1__["mergeObjects"])(args[0], Object(_events__WEBPACK_IMPORTED_MODULE_1__["fakeEvent"])(event));
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
    emitter.listeners = event => Object(_array__WEBPACK_IMPORTED_MODULE_0__["slice"])(listeners(event));
    emitter.on = emitter.addEventListener;
    emitter.off = emitter.removeEventListener;
    emitter.fire = emitter.dispatchEvent;
    emitter.once = function(e, fn) {
      var fire = function() {
        emitter.off(e, fire);
        return fn.apply(null, arguments);
      };
      return emitter.on(e, fire);
    };
    emitter.destroy = () => (events = {});
  }

  return emitter;
};


/***/ }),

/***/ "./src/misc/events.js":
/*!****************************!*\
  !*** ./src/misc/events.js ***!
  \****************************/
/*! exports provided: UPLOAD_EVENTS, COMMON_EVENTS, mergeObjects, proxyEvents, fakeEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UPLOAD_EVENTS", function() { return UPLOAD_EVENTS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "COMMON_EVENTS", function() { return COMMON_EVENTS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mergeObjects", function() { return mergeObjects; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "proxyEvents", function() { return proxyEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fakeEvent", function() { return fakeEvent; });
/* harmony import */ var _window__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./window */ "./src/misc/window.js");


const UPLOAD_EVENTS = ["load", "loadend", "loadstart"];
const COMMON_EVENTS = ["progress", "abort", "error", "timeout"];

const depricatedProp = p =>
  ["returnValue", "totalSize", "position"].includes(p);

const mergeObjects = function(src, dst) {
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
const proxyEvents = function(events, src, dst) {
  const p = event =>
    function(e) {
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
const fakeEvent = function(type) {
  if (_window__WEBPACK_IMPORTED_MODULE_0__["document"] && _window__WEBPACK_IMPORTED_MODULE_0__["document"].createEventObject != null) {
    const msieEventObject = _window__WEBPACK_IMPORTED_MODULE_0__["document"].createEventObject();
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


/***/ }),

/***/ "./src/misc/headers.js":
/*!*****************************!*\
  !*** ./src/misc/headers.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//helper
const convert = function(h, dest) {
  let name;
  if (dest == null) {
    dest = {};
  }
  switch (typeof h) {
    case "object":
      var headers = [];
      for (let k in h) {
        const v = h[k];
        name = k.toLowerCase();
        headers.push(`${name}:\t${v}`);
      }
      return headers.join("\n") + "\n";
    case "string":
      headers = h.split("\n");
      for (let header of Array.from(headers)) {
        if (/([^:]+):\s*(.+)/.test(header)) {
          name = RegExp.$1 != null ? RegExp.$1.toLowerCase() : undefined;
          const value = RegExp.$2;
          if (dest[name] == null) {
            dest[name] = value;
          }
        }
      }
      return dest;
  }
  return [];
};

/* harmony default export */ __webpack_exports__["default"] = ({ convert });


/***/ }),

/***/ "./src/misc/hooks.js":
/*!***************************!*\
  !*** ./src/misc/hooks.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _event_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./event-emitter */ "./src/misc/event-emitter.js");


//global set of hook functions,
//uses event emitter to store hooks
const hooks = Object(_event_emitter__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])(true);

/* harmony default export */ __webpack_exports__["default"] = (hooks);


/***/ }),

/***/ "./src/misc/window.js":
/*!****************************!*\
  !*** ./src/misc/window.js ***!
  \****************************/
/*! exports provided: msie, window, document */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "msie", function() { return msie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "window", function() { return window; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "document", function() { return document; });
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

//find IE version
const useragent =
  typeof navigator !== "undefined" && navigator["useragent"]
    ? navigator.userAgent
    : "";

let msie = null;
if (
  /msie (\d+)/.test(useragent.toLowerCase()) ||
  /trident\/.*; rv:(\d+)/.test(useragent.toLowerCase())
) {
  msie = parseInt(RegExp.$1, 10);
}

const window = result;
const document = result.document;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/patch/fetch.js":
/*!****************************!*\
  !*** ./src/patch/fetch.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _misc_window__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../misc/window */ "./src/misc/window.js");
/* harmony import */ var _misc_events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../misc/events */ "./src/misc/events.js");
/* harmony import */ var _misc_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../misc/hooks */ "./src/misc/hooks.js");
/* harmony import */ var _formdata__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./formdata */ "./src/patch/formdata.js");





//browser's fetch
const Native = _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].fetch;

//xhook's fetch
const Xhook = function(url, options) {
  if (options == null) {
    options = { headers: {} };
  }
  options.url = url;
  let request = null;

  const beforeHooks = _misc_hooks__WEBPACK_IMPORTED_MODULE_2__["default"].listeners("before");
  const afterHooks = _misc_hooks__WEBPACK_IMPORTED_MODULE_2__["default"].listeners("after");

  return new Promise(function(resolve, reject) {
    const getRequest = function() {
      if (options.body instanceof _formdata__WEBPACK_IMPORTED_MODULE_3__["default"].Xhook) {
        options.body = options.body.fd;
      }

      if (options.headers) {
        options.headers = new Headers(options.headers);
      }

      if (!request) {
        request = new Request(options.url, options);
      }

      return Object(_misc_events__WEBPACK_IMPORTED_MODULE_1__["mergeObjects"])(options, request);
    };

    var processAfter = function(response) {
      if (!afterHooks.length) {
        return resolve(response);
      }

      const hook = afterHooks.shift();

      if (hook.length === 2) {
        hook(getRequest(), response);
        return processAfter(response);
      } else if (hook.length === 3) {
        return hook(getRequest(), response, processAfter);
      } else {
        return processAfter(response);
      }
    };

    const done = function(userResponse) {
      if (userResponse !== undefined) {
        const response = new Response(
          userResponse.body || userResponse.text,
          userResponse
        );
        resolve(response);
        processAfter(response);
        return;
      }

      //continue processing until no hooks left
      processBefore();
    };

    var processBefore = function() {
      if (!beforeHooks.length) {
        send();
        return;
      }

      const hook = beforeHooks.shift();

      if (hook.length === 1) {
        return done(hook(options));
      } else if (hook.length === 2) {
        return hook(getRequest(), done);
      }
    };

    var send = () =>
      Native(getRequest())
        .then(response => processAfter(response))
        .catch(function(err) {
          processAfter(err);
          return reject(err);
        });

    processBefore();
  });
};

//patch interface
/* harmony default export */ __webpack_exports__["default"] = ({
  patch() {
    if (Native) {
      _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].fetch = Xhook;
    }
  },
  unpatch() {
    if (Native) {
      _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].fetch = Native;
    }
  },
  Native,
  Xhook
});


/***/ }),

/***/ "./src/patch/formdata.js":
/*!*******************************!*\
  !*** ./src/patch/formdata.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _misc_window__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../misc/window */ "./src/misc/window.js");
/* harmony import */ var _misc_array__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../misc/array */ "./src/misc/array.js");



//note:
// we can patch FormData safely because all XHR
// is hooked, so we can ensure the real FormData
// object is used on send

//browser's FormData
var Native = _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].FormData;

//xhooks's FormData
const Xhook = function(form) {
  this.fd = form ? new Native(form) : new Native();
  this.form = form;
  const entries = [];
  Object.defineProperty(this, "entries", {
    get() {
      //extract form entries
      const fentries = !form
        ? []
        : Object(_misc_array__WEBPACK_IMPORTED_MODULE_1__["slice"])(form.querySelectorAll("input,select"))
            .filter(e => !["checkbox", "radio"].includes(e.type) || e.checked)
            .map(e => [e.name, e.type === "file" ? e.files : e.value]);
      //combine with js entries
      return fentries.concat(entries);
    }
  });
  this.append = function() {
    const args = Object(_misc_array__WEBPACK_IMPORTED_MODULE_1__["slice"])(arguments);
    entries.push(args);
    return this.fd.append.apply(this.fd, args);
  }.bind(this);
};

//patch interface
/* harmony default export */ __webpack_exports__["default"] = ({
  patch() {
    if (Native) {
      _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].FormData = Xhook;
    }
  },
  unpatch() {
    if (Native) {
      _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].FormData = Native;
    }
  },
  Native,
  Xhook
});


/***/ }),

/***/ "./src/patch/xmlhttprequest.js":
/*!*************************************!*\
  !*** ./src/patch/xmlhttprequest.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _misc_window__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../misc/window */ "./src/misc/window.js");
/* harmony import */ var _misc_events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../misc/events */ "./src/misc/events.js");
/* harmony import */ var _misc_event_emitter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../misc/event-emitter */ "./src/misc/event-emitter.js");
/* harmony import */ var _misc_headers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../misc/headers */ "./src/misc/headers.js");
/* harmony import */ var _formdata__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./formdata */ "./src/patch/formdata.js");






const nullify = res => (res === undefined ? null : res);

//browser's XMLHttpRequest
const Native = _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].XMLHttpRequest;

//xhook's XMLHttpRequest
const Xhook = function() {
  const ABORTED = -1;
  const xhr = new Native();

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
  const readHead = function() {
    // Accessing attributes on an aborted xhr object will
    // throw an 'c00c023f error' in IE9 and lower, don't touch it.
    response.status = status || xhr.status;
    if (status !== ABORTED || !(_misc_window__WEBPACK_IMPORTED_MODULE_0__["msie"] < 10)) {
      response.statusText = xhr.statusText;
    }
    if (status !== ABORTED) {
      const object = _misc_headers__WEBPACK_IMPORTED_MODULE_3__["default"].convert(xhr.getAllResponseHeaders());
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

  const readBody = function() {
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
  const writeHead = function() {
    facade.status = response.status;
    facade.statusText = response.statusText;
  };

  const writeBody = function() {
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

  const emitFinal = function() {
    if (!hasError) {
      facade.dispatchEvent("load", {});
    }
    facade.dispatchEvent("loadend", {});
    if (hasError) {
      facade.readyState = 0;
    }
  };

  //ensure ready state 0 through 4 is handled
  const emitReadyState = function(n) {
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
  const setReadyState = function(n) {
    //emit events until readyState reaches 4
    if (n !== 4) {
      emitReadyState(n);
      return;
    }
    //before emitting 4, run all 'after' hooks in sequence
    const hooks = xhook.listeners("after");
    var process = function() {
      if (hooks.length > 0) {
        //execute each 'before' hook one at a time
        const hook = hooks.shift();
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
  var facade = Object(_misc_event_emitter__WEBPACK_IMPORTED_MODULE_2__["EventEmitter"])();
  request.xhr = facade;

  // Handle the underlying ready state
  xhr.onreadystatechange = function(event) {
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
  const hasErrorHandler = function() {
    hasError = true;
  };
  facade.addEventListener("error", hasErrorHandler);
  facade.addEventListener("timeout", hasErrorHandler);
  facade.addEventListener("abort", hasErrorHandler);
  // progress means we're current downloading...
  facade.addEventListener("progress", function(event) {
    if (currentState < 3) {
      setReadyState(3);
    } else if (xhr.readyState <= 3) {
      //until ready (4), each progress event is followed by readystatechange...
      facade.dispatchEvent("readystatechange", {}); //TODO fake an XHR event
    }
  });

  // initialise 'withCredentials' on facade xhr in browsers with it
  // or if explicitly told to do so
  if ("withCredentials" in xhr || xhook.addWithCredentials) {
    facade.withCredentials = false;
  }
  facade.status = 0;

  // initialise all possible event handlers
  for (let event of Array.from(_misc_events__WEBPACK_IMPORTED_MODULE_1__["COMMON_EVENTS"].concat(_misc_events__WEBPACK_IMPORTED_MODULE_1__["UPLOAD_EVENTS"]))) {
    facade[`on${event}`] = null;
  }

  facade.open = function(method, url, async, user, pass) {
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

  facade.send = function(body) {
    //read xhr settings before hooking
    let k, modk;
    for (k of ["type", "timeout", "withCredentials"]) {
      modk = k === "type" ? "responseType" : k;
      if (modk in facade) {
        request[k] = facade[modk];
      }
    }

    request.body = body;
    const send = function() {
      //proxy all events from real xhr to facade
      Object(_misc_events__WEBPACK_IMPORTED_MODULE_1__["proxyEvents"])(_misc_events__WEBPACK_IMPORTED_MODULE_1__["COMMON_EVENTS"], xhr, facade);
      //proxy all upload events from the real to the upload facade
      if (facade.upload) {
        Object(_misc_events__WEBPACK_IMPORTED_MODULE_1__["proxyEvents"])(
          _misc_events__WEBPACK_IMPORTED_MODULE_1__["COMMON_EVENTS"].concat(_misc_events__WEBPACK_IMPORTED_MODULE_1__["UPLOAD_EVENTS"]),
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
      //extract real formdata
      if (request.body instanceof _formdata__WEBPACK_IMPORTED_MODULE_4__["default"].Xhook) {
        request.body = request.body.fd;
      }
      //real send!
      xhr.send(request.body);
    };

    const hooks = xhook.listeners("before");
    //process hooks sequentially
    var process = function() {
      if (!hooks.length) {
        return send();
      }
      //go to next hook OR optionally provide response
      const done = function(userResponse) {
        //break chain - provide dummy response (readyState 4)
        if (
          typeof userResponse === "object" &&
          (typeof userResponse.status === "number" ||
            typeof response.status === "number")
        ) {
          Object(_misc_events__WEBPACK_IMPORTED_MODULE_1__["mergeObjects"])(userResponse, response);
          if (!("data" in userResponse)) {
            userResponse.data = userResponse.response || userResponse.text;
          }
          setReadyState(4);
          return;
        }
        //continue processing until no hooks left
        process();
      };
      //specifically provide headers (readyState 2)
      done.head = function(userResponse) {
        Object(_misc_events__WEBPACK_IMPORTED_MODULE_1__["mergeObjects"])(userResponse, response);
        setReadyState(2);
      };
      //specifically provide partial text (responseText  readyState 3)
      done.progress = function(userResponse) {
        Object(_misc_events__WEBPACK_IMPORTED_MODULE_1__["mergeObjects"])(userResponse, response);
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
      return;
    };
    //kick off
    process();
  };

  facade.abort = function() {
    status = ABORTED;
    if (transiting) {
      xhr.abort(); //this will emit an 'abort' for us
    } else {
      facade.dispatchEvent("abort", {});
    }
  };

  facade.setRequestHeader = function(header, value) {
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
    nullify(_misc_headers__WEBPACK_IMPORTED_MODULE_3__["default"].convert(response.headers));

  //proxy call only when supported
  if (xhr.overrideMimeType) {
    facade.overrideMimeType = function() {
      xhr.overrideMimeType.apply(xhr, arguments);
    };
  }

  //create emitter when supported
  if (xhr.upload) {
    let up = Object(_misc_event_emitter__WEBPACK_IMPORTED_MODULE_2__["EventEmitter"])();
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

Xhook.UNSENT = 0;
Xhook.OPENED = 1;
Xhook.HEADERS_RECEIVED = 2;
Xhook.LOADING = 3;
Xhook.DONE = 4;

//patch interface
/* harmony default export */ __webpack_exports__["default"] = ({
  patch() {
    if (Native) {
      _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].XMLHttpRequest = Xhook;
    }
  },
  unpatch() {
    if (Native) {
      _misc_window__WEBPACK_IMPORTED_MODULE_0__["window"].XMLHttpRequest = Native;
    }
  },
  Native,
  Xhook
});


/***/ })

/******/ });
//# sourceMappingURL=xhook.js.map