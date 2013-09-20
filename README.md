# XHook

v1.0

> ### Easily intercept and modify XHR request and response

<a href="https://twitter.com/intent/tweet?hashtags=xhook%2Cjavascript%2Cxhr&original_referer=http%3A%2F%2Fgithub.com%2F&text=XHook%3A+Easily+intercept+and+modify+XHR+request+and+response&tw_p=tweetbutton&url=https%3A%2F%2Fgithub.com%2Fjpillora%2Fxhook" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png"></img>
</a>


**Attention: XHook has been rewritten to simplify the API**

<!--
[![browser support](https://ci.testling.com/jpillora/xhook.png)](https://ci.testling.com/jpillora/xhook)
-->

With XHook, you could easily implement functionality to:

* Cache requests in memory, localStorage, etc.
* Insert authentication headers
  * S3 Request Signing
* Simulate responses
  * For testing purposes, just add your test hooks and your code can remain the same
* Sending Error statistics to Google Analytics
* Polyfil CORS, by offloading requests to an iframe then splicing the response back in, see [XDomain](http://jpillora.com/xdomain)
* Devious practical jokes
* Preflight GZip compression, see [XZip](http://github.com/jpillora/xzip) (In progress)

## Features

* Intercept and modify XHR **request** and **response**
* Simulate **responses** transparently
* Backwards compatible `addEventListener` `removeEventListener`

## Future Features

* Backwards compatible user controlled progress (download/upload) events

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

<!-- 
[![browser support](https://ci.testling.com/jpillora/xhook.png)](https://ci.testling.com/jpillora/xhook)
 -->

## Live Demos

See the above example and more here:

### *http://jpillora.com/xhook*

## Download

* Development [xhook.js](http://jpillora.com/xhook/dist/1/xhook.js) 7.8KB
* Production [xhook.min.js](http://jpillora.com/xhook/dist/1/xhook.min.js) 3.3KB (0.8KB Gzip)

  *Note: It's **important** to include XHook first as other libraries may store a reference to `XMLHttpRequest` before XHook can patch it*

## API

### `xhook`.`before`(`handler(request[, callback])`)

We can **modify** the `request` before the XHR is sent.

If our `handler` is asynchronous, just include the `callback` argument, which accepts an optional `response` object.

To provide a **fake** response, simply `return` or `callback()` a `response` object.

### `xhook`.`after`(`handler(request, response[, callback])`)

We can **read** the `request` and **modify** the `response` before the XHR is recieved.

If our `handler` is asynchronous, just include the `callback` argument.

### `request` Object

* `method` (String)
* `url` (String)
* `body` (String) **May implement binary data in the future**
* `headers` (Object)
* `timeout` (Number)

### `response` Object

* `status` (Number) **Required when for fake `response`s**
* `statusText` (String)
* `text` (String) *(XMLHttpRequest `responseText`)*
* `headers` (Object)
* `type` (String) *(XMLHttpRequest `responseType`)*
* `xml` (XML) *(XMLHttpRequest `responseXML`)*
* `data` (Varies) *(XMLHttpRequest `response`)*

### Overview

<img src="https://docs.google.com/drawings/d/1PTxHDqdW9iNqagDwtaO0ggXZkJp7ILiRDVWAMHInFGQ/pub?w=498&amp;h=235">

*The dark red `before` hook is returning a `response` object, which will trigger the `after`
hooks, then trigger the appropriate events, so it **appears** as if `response` came from 
the server.*

### Reference

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

### Issues

* `xhr instanceof XMLHttpRequest` checks will return `false`

* XHook does **not** attempt to resolve any browser compatibility issues. Libraries like jQuery 
and https://github.com/ilinsky/xmlhttprequest will attempt to do this. XHook simply proxies to and from `XMLHttpRequest` and `ActiveXObject`, so you may use any library
conjunction with XHook, just make sure to load XHook **first**. 

### Old Version

Version 0.x docs and downloads can be found [here](https://github.com/jpillora/xhook/tree/a42c8814bd052f03cfb3a1d7848a37df5a5d0563) 

#### MIT License

Copyright © 2013 Jaime Pillora &lt;dev@jpillora.com&gt;

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

