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

export const windowRef = result;
export const documentRef = result.document;
