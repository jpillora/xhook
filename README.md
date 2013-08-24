# *In progress*

---

# XHR Hook

> Easily modify XHR requests and responses

## Examples

**[Modify response text of requests to 'example2.json'](http://jpillora.com/xhr-hook#jquery)**

``` javascript
XHRHook(function(xhr) {
  xhr.on('set:responseText', function(curr, prev) {
    if(xhr.url.match(/example2\.json$/))
      return curr.replace(/[aeiou]/g,'z');
  });
});
```

### *See all examples here*

> ### http://jpillora.com/xhr-hook

## Download

* Development [xhr-hook.js](https://raw.github.com/jpillora/xhr-hook/ghpages/dist/xhr-hook.js) 5KB
* Production [xhr-hook.min.js](https://raw.github.com/jpillora/xhr-hook/ghpages/dist/xhr-hook.min.js) 2.3KB

## API

### XHRHook(`callback(xhr)`)

Adds a hook

`callback` will be called with an `xhr` instance

### `xhr`.`onChange`(`propertyName`, `callback(curr, prev)`)

Intercept a property change

`curr` is the current, `prev` is the previous values of that property,
to use a value other than `curr`, simply return different value.

### `xhr`.`onCall`(`methodName`, `callback(args)`)

Intercept a method call

`args` is a modifiable array of arguments

> Tip: `"open"` has args `[method, url]`

### `xhr`.`trigger`(`event`, `[, arg1, arg2, ...]`)

Manually trigger XHR events

*In progress...*

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

