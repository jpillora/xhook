
*In progress*

---

# XHR Hook

> Allows modification of all requests and responses for use in any library

## Examples

### Modify response text

``` javascript
XHRHook.on('request', function(req) {
  
  req.on('set:responseText', function(value) {
    return value.replace(/[z]/g, 'a');
  });

});
```

### Dummy response

``` javascript
XHRHook.on('request', function(req) {
  
  req.on('call:send', function() {

    req.emit('onload', { progress: 0.4 });

    req.state = ''

    req.emit('onload', { progress: 0.4 });


    req.emit('onload', { progress: 0.4 });

    return false;
  });

});
```

## API



