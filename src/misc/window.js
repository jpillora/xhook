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

export let msie = null;
if (
  /msie (\d+)/.test(useragent.toLowerCase()) ||
  /trident\/.*; rv:(\d+)/.test(useragent.toLowerCase())
) {
  msie = parseInt(RegExp.$1, 10);
}

export const windowRef = result;
export const documentRef = result.document;
