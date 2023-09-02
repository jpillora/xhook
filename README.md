# XHook

#### Easily intercept and modify XHR ("AJAX") request and response

<a href="https://twitter.com/intent/tweet?hashtags=xhook%2Cjavascript%2Cxhr&original_referer=http%3A%2F%2Fgithub.com%2F&text=XHook%3A+Easily+intercept+and+modify+XHR+request+and+response&tw_p=tweetbutton&url=https%3A%2F%2Fgithub.com%2Fjpillora%2Fxhook" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png"></img>
</a>

With XHook, you could easily implement functionality to:

- Cache requests in memory, localStorage, etc.
- Insert authentication headers
  - S3 Request Signing, see [S3 Hook](https://github.com/jpillora/s3hook)
- Simulate responses
  - Create fake transparent backends for testing purposes
- Sending Error statistics to Google Analytics
- Create a client-side alternative to CORS by offloading requests to an iframe then splicing the response back in, see [XDomain](http://jpillora.com/xdomain)
- Devious practical jokes
- Supports RequiresJS and Browserify
- Preflight GZip compression, see [XZip](http://github.com/jpillora/xzip) (Incomplete)

## Features

- Intercept and modify XMLHttpRequest ("AJAX") **request** and **response**
- Simulate **responses** transparently
- Backwards compatible `addEventListener` `removeEventListener`
- Backwards compatible user controlled progress (download/upload) events

## Browser Support

Support Modern Browser.

## Demos

### *http://jpillora.com/xhook*

## Usage

:warning: _It's_ **important** _to include XHook first as other libraries may store a reference to `XMLHttpRequest` before XHook can patch it_

Using `script` link to load xhook and use it, like so:

```html
<script src="//unpkg.com/xhook@latest/dist/xhook.min.js"></script>
<script>
  xhook.after(function (request, response) {
    if (request.url.match(/example\.txt$/))
      response.text = response.text.replace(/[aeiou]/g, "z");
  });
</script>
```

- Development [xhook.js](https://jpillora.com/xhook/dist/xhook.js)
- Production [xhook.min.js](https://jpillora.com/xhook/dist/xhook.min.js)
- CDN (Use `latest` or lock to one of the [available versions](https://github.com/jpillora/xhook/releases))

We can also install xhook via npm.

```bash
npm install xhook
```

Then use ESM syntax to load xhook.

```js
import xhook from "xhook";
//modify 'responseText' of 'example2.txt'
xhook.after(function (request, response) {
  if (request.url.match(/example\.txt$/))
    response.text = response.text.replace(/[aeiou]/g, "z");
});
```

## API

### `xhook.before(handler(request[, callback])[, index])`

Modifying **any** property of the `request` object will modify the underlying XHR before it is sent.

To make the `handler` is asynchronous, just include the optional `callback` function, which accepts an optional `response` object.

To provide a **fake** response, `return` **or** `callback()` a `response` object.

### `xhook.after(handler(request, response[, callback]) [, index])`

Modifying **any** property of the `response` object will modify the underlying XHR before it is received.

To make the `handler` is asynchronous, just include the optional `callback` function.

### `xhook.enable()`

Enables XHook (swaps out the native `XMLHttpRequest` class). XHook is enabled by default.

### `xhook.disable()`

Disables XHook (swaps the native `XMLHttpRequest` class back in)

---

### `request` Object

- `method` (String) (_<a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#open()">`open(method,url)`</a>_)
- `url` (String) (_<a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#open()">`open(method,url)`</a>_)
- `body` (String) (_<a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#send()">`send(body)`</a>_)
- `headers` (Object) (_Contains Name-Value pairs set with <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#setRequestHeader()">`setRequestHeader(name,value)`</a>_)
- `timeout` (Number) _([`timeout`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#timeout))_
- `type` (String) _([`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#responseType))_
- `withCredentials` (String) _([`withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#withCredentials))_

### `response` Object

- `status` (Number) **Required when for fake `response`s** _([`status`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#status))_
- `statusText` (String) _([`statusText`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#statusText))_
- `text` (String) _([`responseText`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#responseText))_
- `headers` (Object) (_Contains Name-Value pairs retrieved with <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#getAllResponseHeaders()">`getAllResponseHeaders()`</a>_)
- `xml` (XML) _([`responseXML`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#responseXML))_
- `data` (Varies) _([`response`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#response))_

## Overview

<img src="https://docs.google.com/drawings/d/1PTxHDqdW9iNqagDwtaO0ggXZkJp7ILiRDVWAMHInFGQ/pub?w=498&amp;h=235">

_The dark red `before` hook is returning a `response` object, which will trigger the `after`
hooks, then trigger the appropriate events, so it_ **appears** _as if `response` came from
the server._

## Reference

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

http://www.w3.org/TR/XMLHttpRequest/

http://www.w3.org/TR/XMLHttpRequest2/

## Issues

- XHook does **not** attempt to resolve any browser compatibility issues. Libraries like jQuery
  and https://github.com/ilinsky/xmlhttprequest will attempt to do this. XHook simply proxies to and from `XMLHttpRequest`, so you may use any library
  conjunction with XHook, just make sure to load XHook **first**.

- You may use synchronous XHR, though this will cause asynchronous hooks to be **skipped**.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for instructions on how to build and run XHook locally.

## License

[MIT](LICENSE) License Copyright © 2022 Jaime Pillora dev@jpillora.com
