# XHook

#### Easily intercept and modify XHR ("AJAX") request and response

<a href="https://twitter.com/intent/tweet?hashtags=xhook%2Cjavascript%2Cxhr&original_referer=http%3A%2F%2Fgithub.com%2F&text=XHook%3A+Easily+intercept+and+modify+XHR+request+and+response&tw_p=tweetbutton&url=https%3A%2F%2Fgithub.com%2Fjpillora%2Fxhook" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png"></img>
</a>

With XHook, you could easily implement functionality to:

* Cache requests in memory, localStorage, etc.
* Insert authentication headers
  * S3 Request Signing, see [S3 Hook](https://github.com/jpillora/s3hook)
* Simulate responses
  * Create fake transparent backends for testing purposes
* Sending Error statistics to Google Analytics
* Create a client-side alternative to CORS by offloading requests to an iframe then splicing the response back in, see [XDomain](http://jpillora.com/xdomain)
* Devious practical jokes
* Supports RequiresJS and Browserify
* Preflight GZip compression, see [XZip](http://github.com/jpillora/xzip) (Incomplete)

## Features

* Intercept and modify XMLHttpRequest ("AJAX") **request** and **response**
* Simulate **responses** transparently
* Backwards compatible `addEventListener` `removeEventListener`
* Backwards compatible user controlled progress (download/upload) events

## Future Features

* Add BrowserSwarm or TestlingCI automated cross-browser tests

  *Tip: See [CONTRIBUTING.md](CONTRIBUTING.md) for steps on how to contribute* :wink:

## Example

Here, we're converting vowels to **z**'s in all requests to 'example.txt':

``` javascript
//modify 'responseText' of 'example2.txt'
xhook.after(function(request, response) {
  if(request.url.match(/example\.txt$/))
    response.text = response.text.replace(/[aeiou]/g,'z');
});
```

## Browser Support

Tested in IE8+, Chrome, Firefox, Safari

#### *Run test suite here: http://jpillora.com/xhook/test*

<!--
[![browser support](https://ci.testling.com/jpillora/xhook.png)](https://ci.testling.com/jpillora/xhook)
 -->

## Demos

### *http://jpillora.com/xhook*

## Download

  :warning:    *It's* **important** *to include XHook first as other libraries may store a reference to `XMLHttpRequest` before XHook can patch it*

* Development [xhook.js](https://jpillora.com/xhook/dist/xhook.js) 14KB
* Production [xhook.min.js](https://jpillora.com/xhook/dist/xhook.min.js) 6KB
* CDN (Use `latest` or lock to one of the [available versions](https://github.com/jpillora/xhook/releases))

	``` html
	<script src="//unpkg.com/xhook@latest/dist/xhook.min.js"></script>
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

Enables XHook (swaps out the native `XMLHttpRequest` class). XHook is enabled be default.

### `xhook.disable()`

Disables XHook (swaps the native `XMLHttpRequest` class back in)

---

### `request` Object

* `method` (String) (*<a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#open()">`open(method,url)`</a>*)
* `url` (String) (*<a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#open()">`open(method,url)`</a>*)
* `body` (String) (*<a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#send()">`send(body)`</a>*)
* `headers` (Object) (*Contains Name-Value pairs set with <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#setRequestHeader()">`setRequestHeader(name,value)`</a>*)
* `timeout` (Number) *([`timeout`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#timeout))*
* `type` (String) *([`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#responseType))*
* `withCredentials` (String) *([`withCredentials`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#withCredentials))*

### `response` Object

* `status` (Number) **Required when for fake `response`s** *([`status`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#status))*
* `statusText` (String) *([`statusText`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#statusText))*
* `text` (String) *([`responseText`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#responseText))*
* `headers` (Object) (*Contains Name-Value pairs retrieved with <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#getAllResponseHeaders()">`getAllResponseHeaders()`</a>*)
* `xml` (XML) *([`responseXML`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#responseXML))*
* `data` (Varies) *([`response`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#response))*

### Overview

<img src="https://docs.google.com/drawings/d/1PTxHDqdW9iNqagDwtaO0ggXZkJp7ILiRDVWAMHInFGQ/pub?w=498&amp;h=235">

*The dark red `before` hook is returning a `response` object, which will trigger the `after`
hooks, then trigger the appropriate events, so it* **appears** *as if `response` came from
the server.*

### Reference

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

http://www.w3.org/TR/XMLHttpRequest/

http://www.w3.org/TR/XMLHttpRequest2/

### Issues

* XHook does **not** attempt to resolve any browser compatibility issues. Libraries like jQuery
and https://github.com/ilinsky/xmlhttprequest will attempt to do this. XHook simply proxies to and from `XMLHttpRequest`, so you may use any library
conjunction with XHook, just make sure to load XHook **first**.

* You may use synchronous XHR, though this will cause asynchronous hooks to be **skipped**.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for instructions on how to build and run XHook locally.

Contributors:

* Jaime Pillora <dev@jpillora.com>
* Daniel Gasienica <daniel@gasienica.ch>
* Maayan Glikser <maayan@glikm.com>

#### MIT License

Copyright © 2014 Jaime Pillora <dev@jpillora.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
