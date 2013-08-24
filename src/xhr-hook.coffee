
#XMLHTTP Object Properties
FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"]
EVENTS = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"]
PROPS = ["statusText", "status", "response", "responseType", "responseXML", "responseText", "upload", "readyState", "withCredentials"]

create = (parent) ->
  F = ->
  F.prototype = parent
  new F

#main method
XHRHook = (callback) ->
  XHRHook.s.push callback
#array of xhr hook (callback)s
XHRHook.s = []

#patch XMLHTTP
patchClass = (name) ->
  Class = window[name]
  return unless Class
  window[name] = (arg) ->
    return if typeof arg is "string" and not /\.XMLHTTP/.test(arg)
    console.log 'creating a ' + name
    patchXhr new Class(arg), Class

patchClass "ActiveXObject"
patchClass "XMLHttpRequest"

#make patched version
patchXhr = (xhr, Class) ->
  #keeps track of changes using "dirty-checking"
  xhrDup = {}

  #facade XHR - initialise 'withCredentials' on object so jQuery thinks we have CORS
  x = withCredentials: false

  #set modified values here
  data =
   requestHeaders: {}
   responseHeaders: {}

  #presented to the user for modifying
  user = create data
  user.callbacks = []
  userOn = (event, callback) ->
    (user.callbacks[event] or (user.callbacks[event] = [])).push callback
  user.onChange = (event, callback) ->
    userOn "<:#{event}", callback
  user.onCall = (event, callback) ->
    userOn ">:#{event}", callback

  #send method calls TO xhr
  for fn in FNS
    ((key) ->
      x[key] = (args...)->
        #extract info
        switch key
          when "send"
            data.data = args[0]
          when "open"
            data.method = args[0]
            data.url = args[1]
            data.async = args[2]
          when "setRequestHeader"
            data.requestHeaders[args[0]] = args[1]

        #run all hooks
        newargs = args
        callbacks = user.callbacks[">:#{key}"]
        if callbacks
          for callback in callbacks
            result = callback args
            newargs = result if result

        #call on xhr if able
        if xhr[key]
          ret = xhr[key].apply xhr, newargs
          # console.log 'call %s with [%s] returned %s', key, newargs.join(', '), ret

        ret
    )(fn)
  
  #dirty check
  setAllValues = ->
    try
      for prop in PROPS
        setValue prop, xhr[prop]

  #handle value changes
  setValue = (prop, curr) ->
    prev = xhrDup[prop]
    return if curr is prev
    xhrDup[prop] = curr

    #HTTP header recieved
    if prop is 'readyState' and curr is 2
      data.statusCode = xhr.status
      headers = xhr.getAllResponseHeaders().split '\n'
      for header in headers
        h = if /([^:]+):\s*(.*)/.test(header) then {k:RegExp.$1,v:RegExp.$2}
        data.responseHeaders[h.k] = h.v if h

    #run all hooks
    callbacks = user.callbacks["<:#{prop}"]
    if callbacks
      for callback in callbacks
        result = callback curr, prev
        override = result if result isnt `undefined`

    x[prop] = if override is `undefined` then curr else override
    # console.log 'set %s: "%s" -> "%s"', prop, prev, x[prop]

  cloneEvent = (e) ->
    clone = {}
    for key, val of e
      clone[key] = if val is xhr then x else val
    clone

  #recieve event calls FROM xhr
  for eventName in EVENTS
    ((eventName) ->
      xhr[eventName] = (event) ->
        setAllValues()
        copy = cloneEvent(event) if event
        # console.log 'caught %s with', eventName, copy
        # window.E.push copy
        x[eventName].call x, copy if x[eventName]
    )(eventName)

  #set initial values
  setAllValues()

  #fill in the gaps
  for key of xhr
    if x[key] is `undefined` and key not in EVENTS
      try
        x[key] = xhr[key]

  #provide api into this XHR to the user 
  for callback in XHRHook.s
    callback.call null, user

  #return facade XHR
  return x

#publicise
window.XHRHook = XHRHook

