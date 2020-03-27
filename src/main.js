import { EventEmitter } from "./misc/event-emitter";
import { window } from "./misc/window";
import headers from "./misc/headers";

//patchable types
import XMLHttpRequest from "./patch-xhr";
import fetch from "./patch-fetch";
import formData from "./patch-form-data";

//global state
import hooks from "./misc/hooks";
//the global hooks event emitter is also the global xhook object
//(not the best decision in hindsight)
const xhook = hooks;
xhook.EventEmitter = EventEmitter;
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
  XMLHttpRequest.patch();
  fetch.patch();
  formData.patch();
};
xhook.disable = function() {
  XMLHttpRequest.unpatch();
  fetch.unpatch();
  formData.unpatch();
};
//expose native objects
xhook.XMLHttpRequest = XMLHttpRequest.Native;
xhook.fetch = fetch.Native;
xhook.FormData = formData.Native;

//expose helpers
xhook.headers = headers.convert;

//enable by default
xhook.enable();

//publicise (amd+commonjs+window)
if (typeof define === "function" && define.amd) {
  define("xhook", [], () => xhook);
} else if (typeof module === "object" && module.exports) {
  module.exports = { xhook };
} else if (window) {
  window.xhook = xhook;
}
