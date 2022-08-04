import { windowRef } from "../misc/window";
import { slice } from "../misc/array";

//note:
// we can patch FormData safely because all XHR
// is hooked, so we can ensure the real FormData
// object is used on send

//browser's FormData
var Native = windowRef.FormData;

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
        : slice(form.querySelectorAll("input,select"))
            .filter(e => !["checkbox", "radio"].includes(e.type) || e.checked)
            .map(e => [e.name, e.type === "file" ? e.files : e.value]);
      //combine with js entries
      return fentries.concat(entries);
    }
  });
  this.append = function() {
    const args = slice(arguments);
    entries.push(args);
    return this.fd.append.apply(this.fd, args);
  }.bind(this);
};

//patch interface
export default {
  patch() {
    if (Native) {
      windowRef.FormData = Xhook;
    }
  },
  unpatch() {
    if (Native) {
      windowRef.FormData = Native;
    }
  },
  Native,
  Xhook
};
