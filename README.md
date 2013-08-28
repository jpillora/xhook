# *In progress*

---

# XHook

> Hook (monkey-patch) XHR to easily modify requests and responses

With XHook, you could easily implement functionality to:
* Cache requests in memory
* Insert authentication headers
* Simulate responses
  * For testing purposes, just add your test hooks and everything else stays the same
  * For cross-domain requests, offload requests to an iframe then simulate a successful response, see [XDomain](http://jpillora.com/xhook)
* Error tracking to Google Analytics


## Examples

**[Modify response text of requests to 'example2.json'](http://jpillora.com/xhook#jquery)**

``` javascript
xhook(function(xhr) {
  xhr.on('set:responseText', function(curr, prev) {
    if(xhr.url.match(/example2\.json$/))
      return curr.replace(/[aeiou]/g,'z');
  });
});
```

### *See all examples here*

> ### http://jpillora.com/xhook

## Download

* Development [xhook.js](http://jpillora.com/xhook/dist/xhook.js) 7.5KB
* Production [xhook.min.js](http://jpillora.com/xhook/dist/xhook.min.js) 3.1KB (0.7KB Gzip)

* Note: It's **important** to include XHook first as other libraries may
  store a reference to `XMLHttpRequest` before XHook can patch it*

## API

### xhook(`callback(xhr)`)

Adds a hook

`callback` will be called with an xhook `xhr` instance

### `xhr`.`set`(`propertyName`, `value`)

Sets a property to a new value, which the underlying XHR cannot modify

*Note, when setting `readyState`: This will `xhr.trigger()` all of the remaining *unfired* events (`readystatechange`,`onload`,etc.). So make you `xhr.set()`/`setResponseHeader()` the appropriate values (`responseText`, `status`,etc.)
prior to setting `readyState`.*

*Will not fire the `onChange()` handler*

### `xhr`.`setRequestHeader`(`key`, `value`)

Sets a request header, which the underlying XHR cannot modify

### `xhr`.`setResponseHeader`(`key`, `value`)

Sets a response header, which the underlying XHR cannot modify

### `xhr`.`onChange`(`propertyName`, `callback(curr, prev)`)

Intercept a property change

`curr` is the current, `prev` is the previous values of that property,
to use a value other than `curr`, simply return different value.

### `xhr`.`onCall`(`methodName`, `callback(args)`)

Intercept a method call

`args` is a modifiable array of arguments

If you return `undefined` (or equivalently return nothing), `args`
will be used. If you return a new array, it will be used. If you
return `false` the method call will be cancelled.

> Tip: `"open"` has args `[method, url]`

### `xhr`.`trigger`(`event`, `obj` = {})

Manually trigger XHR events

Will set `obj.type = event`

### Issues

* `xhr instanceof XMLHttpRequest` checks will return `false`

* XHook does **not** attempt to resolve any browser compatibility issues. Libraries like jQuery 
and https://github.com/ilinsky/xmlhttprequest will attempt to do this. XHook simply proxies and
modifies calls to and from XMLHttpRequest (and ActiveXObject), so you may use any library
conjunction with XHook, just make sure to load XHook **first**. 

### Reference

For the complete list of properties, methods and events, see:

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

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

