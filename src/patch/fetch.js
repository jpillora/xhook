import { windowRef } from "../misc/window";
import { mergeObjects } from "../misc/events";
import hooks from "../misc/hooks";
import formData from "./formdata";

//browser's fetch
const Native = windowRef.fetch;

//xhook's fetch
const Xhook = function(url, options) {
  if (options == null) {
    options = { headers: {} };
  }

  let request = null;

  if (url instanceof Request) {
    request = url
  } else {
    options.url = url;
  }

  const beforeHooks = hooks.listeners("before");
  const afterHooks = hooks.listeners("after");

  return new Promise(function(resolve, reject) {
    let fullfiled = resolve
    const getRequest = function() {
      if (options.body instanceof formData.Xhook) {
        options.body = options.body.fd;
      }

      if (options.headers) {
        options.headers = new Headers(options.headers);
      }

      if (!request) {
        request = new Request(options.url, options);
      }

      return mergeObjects(options, request);
    };

    var processAfter = function(response) {
      if (!afterHooks.length) {
        return fullfiled(response);
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
          fullfiled = reject
          processAfter(err);
          return reject(err);
        });

    processBefore();
  });
};

//patch interface
export default {
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
  Xhook
};
