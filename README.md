# XHook

v1.0

> Easily intercept and modify XHR request and response

<a href="https://twitter.com/intent/tweet?hashtags=xhook%2Cjavascript%2Cxhr&original_referer=http%3A%2F%2Fgithub.com%2F&text=XHook%3A+Easily+intercept+and+modify+XHR+request+and+response&tw_p=tweetbutton&url=https%3A%2F%2Fgithub.com%2Fjpillora%2Fxhook" target="_blank">
  <img src="http://jpillora.com/github-twitter-button/img/tweet.png"></img>
</a>

**Automated browser testing in progress**

<!--
[![browser support](https://ci.testling.com/jpillora/xhook.png)](https://ci.testling.com/jpillora/xhook)
-->

**Attention: XHook has been rewritten with a largely simplified API**

With XHook, you could easily implement functionality to:

* Cache requests in memory, localStorage, etc.
* Insert authentication headers
  * S3 Request Signing
* Simulate responses
  * For testing purposes, just add your test hooks and your code can remain the same
* Sending Error statistics to Google Analytics
* Polyfil CORS, by offloading requests to an iframe then splicing the response back in, see [XDomain](http://jpillora.com/xdomain)
* Devious practical jokes
* Preflight GZip compression, see [XZip](http://jpillora.com/xzip)

## Features

* Intercept and modify XHR value changes
* Intercept and modify XHR method calls 
* Manually trigger XHR events 

## Example

We could use XHook all requests to 'example.json' and convert all vowels to **z**'s like:

``` javascript
//modify 'responseText' of 'example2.txt'
xhook.afterSend(function(request, response) {
  if(request.url.match(/example2\.txt$/)) 
    response.text = response.text.replace(/[aeiou]/g,'z');
});
```

## Live Demos

See the above example and more here:

### *http://jpillora.com/xhook*

## Download

* Development [xhook.js](http://jpillora.com/xhook/dist/1/xhook.js) 8.9KB
* Production [xhook.min.js](http://jpillora.com/xhook/dist/1/xhook.min.js) 3.6KB (0.9KB Gzip)

* Note: It's **important** to include XHook first as other libraries may
  store a reference to `XMLHttpRequest` before XHook can patch it*

## API

This library assumes minor knowledge of:

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

### xhook.`beforeSend`(`handler(request [, callback])`)

We can modify the `request` before the XHR is sent.

To use provide a **fake** response, simply return a `response` object.

If our handler is asynchronous, just include the `callback` argument, which
also accepts an optional `response` object.

### xhook.`afterSend`(`handler(request, response, [, callback])`)

We can read the `request` and modify the `response` before the XHR is recieved.

If our handler is asynchronous, just include the `callback` argument.

### `request` Object

* `method` (String) - HTTP Method
* `url` (String) - URL

### `response` Object

* `status` (Number) - HTTP Status Code **(Required when for fake `response`s)**
* `statusText` (String) - String representation of the status code
* `type` (String) *Default: `""`* - The type of response
* `text` (String) - The HTTP response text
* `body` (Varies by `type`) - *Currently equivalent to `text` - JSON type in progress*
* `xml` (XML) - Parsed `text` when `type` is `"xml"`

### Overview

<img src="https://docs.google.com/drawings/d/1PTxHDqdW9iNqagDwtaO0ggXZkJp7ILiRDVWAMHInFGQ/pub?w=498&amp;h=235">

*The dark red `beforeSend` hook is returning a `response` object, which will cancel the underlying XHR and use `response` as a **fake** response.*

### Issues

* `xhr instanceof XMLHttpRequest` checks will return `false`

* XHook does **not** attempt to resolve any browser compatibility issues. Libraries like jQuery 
and https://github.com/ilinsky/xmlhttprequest will attempt to do this. XHook simply proxies and
modifies calls to and from XMLHttpRequest (and ActiveXObject), so you may use any library
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

