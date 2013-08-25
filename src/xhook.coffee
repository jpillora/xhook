
#XMLHTTP Object Properties
FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"]
EVENTS = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"]
PROPS = ["readyState", "responseText", "statusText", "status", "response", "responseType", "responseXML", "upload", "withCredentials"]

#for compression
READY_STATE = PROPS[0]
RESPONSE_TEXT = PROPS[1]

create = (parent) ->
  F = ->
  F.prototype = parent
  new F

#main method
xhook = (callback) ->
  xhook.s.push callback
#array of xhr hook (callback)s
xhook.s = []

#patch XMLHTTP
patchClass = (name) ->
  Class = window[name]
  return unless Class
  window[name] = (arg) ->
    return if typeof arg is "string" and not /\.XMLHTTP/.test(arg)
    patchXhr new Class(arg), Class

patchClass "ActiveXObject"
patchClass "XMLHttpRequest"

#make patched version
patchXhr = (xhr, Class) ->

  #if not set - will return original xhr
  hooked = false

  #keeps track of changes using "dirty-checking"
  xhrDup = {}

  #facade XHR - initialise 'withCredentials' on object so jQuery thinks we have CORS
  x = withCredentials: false

  #set modified values here
  requestHeaders = {}
  responseHeaders = {}
  data = {}

  #make fake events
  cloneEvent = (e) ->
    clone = {}
    for key, val of e
      clone[key] = if val is xhr then x else val
    clone

  #presented to the user for modifying
  user = create data

  userSets = {}
  user.set = (prop, val) ->
    hooked = true
    userSets[prop] = 1
    x[prop] = val

  #user headers take precedence
  userRequestHeaders = {}
  user.setRequestHeader = (key, val) ->
    hooked = true
    userRequestHeaders[key] = val
    return unless data.opened
    xhr.setRequestHeader key, val

  userResponseHeaders = create responseHeaders
  user.setResponseHeader = (key, val) ->
    hooked = true
    userResponseHeaders[key] = val

  userOnChanges = {}
  userOnCalls = {}
  user.onChange = (event, callback) ->
    hooked = true
    (userOnChanges[event] = userOnChanges[event] or []).push callback
  user.onCall = (event, callback) ->
    hooked = true
    (userOnCalls[event] = userOnCalls[event] or []).push callback
  user.trigger = (event, obj = {}) ->
    event = event.replace /^on/,''
    obj.type = event
    # console.log 'user trigger', event, obj
    x['on'+event]?.call x, obj

  user.triggerComplete = ->
    while x[READY_STATE] <= 4
      curr = x[READY_STATE] + 1
      user.set READY_STATE, curr
      user.trigger 'readystatechange'
      if curr is 1
        user.trigger 'loadstart'
      if curr is 4
        user.trigger 'load'
        user.trigger 'loadend'
    null

  #send method calls TO xhr
  for fn in FNS
    ((key) ->
      x[key] = (args...)->

        #run all hooks
        newargs = args
        callbacks = userOnCalls[key] or []
        for callback in callbacks
          result = callback args
          #cancel call
          return if result is false
          newargs = result if result

        # console.log 'call %s with [%s]', key, args.join(', ')

        #extract info
        switch key
          when "getAllResponseHeaders"
            headers = []
            for k,v of userResponseHeaders
              headers.push "#{k}:\t#{v}"
            return headers.join '\n'
          when "send"
            data.data = newargs[0]
          when "open"
            data.method = newargs[0]
            data.url = newargs[1]
            data.async = newargs[2]
          when "setRequestHeader"
            requestHeaders[newargs[0]] = newargs[1]
            return if userRequestHeaders[newargs[0]]

        #data
        data.opened = not data.opened and key is 'open'
        data.sent = not data.sent and key is 'send'

        #call on xhr if able
        xhr[key].apply xhr, newargs if xhr[key]
    )(fn)
  
  #dirty check
  setAllValues = ->
    try
      for prop in PROPS
        setValue prop, xhr[prop]
    catch err
      if err.constructor.name is 'TypeError'
        throw err

  #handle value changes
  setValue = (prop, curr) ->
    prev = xhrDup[prop]
    return if curr is prev
    xhrDup[prop] = curr

    if prop is READY_STATE
      #opened
      if curr is 1
        for key, val of userRequestHeaders
          xhr.setRequestHeader key, val

      #recieved header
      if curr is 2
        data.statusCode = xhr.status
        headers = xhr.getAllResponseHeaders().split '\n'
        for header in headers
          h = if /([^:]+):\s*(.*)/.test(header) then {k:RegExp.$1,v:RegExp.$2}
          responseHeaders[h.k] = h.v if h and not responseHeaders[h.k]

    #run all hooks
    callbacks = userOnChanges[prop] or []
    for callback in callbacks
      result = callback curr, prev
      override = result if result isnt `undefined`

    #already set by the user
    return if userSets[prop]

    x[prop] = if override is `undefined` then curr else override
    # console.log 'set %s: "%s" -> "%s"', prop, prev, x[prop]

  #recieve event calls FROM xhr
  for eventName in EVENTS
    ((eventName) ->
      xhr[eventName] = (event) ->
        setAllValues()
        copy = cloneEvent(event) if event
        # console.log 'caught %s ', eventName
        (window.E = window.E or []).push copy
        if x[eventName]
          # console.log 'caught AND CALLING %s with', eventName, data.url,copy
          x[eventName].call x, copy
    )(eventName)

  #set initial values
  setAllValues()

  #fill in the gaps
  for key of xhr
    if x[key] is `undefined` and key not in EVENTS
      try
        x[key] = xhr[key]
  
  #provide api into this XHR to the user 
  for callback in xhook.s
    callback.call null, user

  return if hooked then x else xhr

#publicise
window.xhook = xhook

