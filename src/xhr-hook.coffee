
consts = ["UNSENT", "OPENED", "HEADERS_RECEIVED", "LOADING", "DONE"]
fns = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"]
events = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"]
status = ["statusText", "status", "response", "responseType", "responseXML", "responseText", "upload", "readyState", "withCredentials"]
patchXhr = (xhr, Class) ->
  
  #init 'withCredentials' on object so jQuery thinks we have CORS
  x = withCredentials: false
  i = undefined
  req = headers: {}
  res = headers: {}
  copyStatus = ->
    try
      for i of status
        x[status[i]] = (if status[i] is "responseText" then xhr[status[i]].replace(/[aeiou]/g, "z") else xhr[status[i]])

  
  #send method calls TO xhr
  copyFn = (key) ->
    x[key] = ->
      switch key
        when "send"
          req.data = arguments_[0]
        when "open"
          req.method = arguments_[0]
          req.url = arguments_[1]
          req.async = arguments_[2]
        when "setRequestHeader"
          req.headers[arguments_[0]] = arguments_[1]
      xhr[key].apply xhr, arguments_  if xhr[key]

  for i of fns
    copyFn fns[i]
  
  #recieve event calls FROM xhr
  proxyEvent = (key) ->
    xhr[key] = ->
      copyStatus()
      console.log req  if x[key] and xhr.readyState is 4
      x[key].apply x, arguments_  if x[key]

  for i of events
    proxyEvent events[i]
  x

patchClass = (name) ->
  Class = window[name]
  return  unless Class
  window[name] = (arg) ->
    return  if typeof arg is "string" and not /\.XMLHTTP/.test(arg)
    patchXhr new Class(arg), Class

patchClass "ActiveXObject"
patchClass "XMLHttpRequest"
