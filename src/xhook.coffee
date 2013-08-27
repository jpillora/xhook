
#XMLHTTP Object Properties
FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType", "addEventListener", "removeEventListener", "dispatchEvent"]
EVENTS = ["onreadystatechange", "onprogress", "onloadstart", "onloadend", "onload", "onerror", "onabort"]
PROPS = ["readyState", "responseText", "withCredentials", "statusText", "status", "response", "responseType", "responseXML", "upload"]

#for compression
READY_STATE = PROPS[0]
RESPONSE_TEXT = PROPS[1]
WITH_CREDS = PROPS[2]

create = (parent) ->
  F = ->
  F.prototype = parent
  new F

#main method
xhook = (callback) ->
  xhook.s.push callback
#array of xhr hook (callback)s
xhook.s = []

convertHeaders = (h, dest = {}) ->
  switch  typeof h
    when "object"
      headers = []
      for k,v of h
        headers.push "#{k}:\t#{v}"
      return headers.join '\n'
    when "string"
      headers = h.split '\n'
      for header in headers
        if /([^:]+):\s*(.+)/.test(header)
          dest[RegExp.$1] = RegExp.$2 if not dest[RegExp.$1]
      return dest
  return

xhook.headers = convertHeaders

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
  x = {}
  x[WITH_CREDS] = false

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

    if prop is READY_STATE
      while x[READY_STATE] < val
        x[READY_STATE]++
        continue if x[READY_STATE] is xhr[READY_STATE]
        user.set READY_STATE, x[READY_STATE]
        user.trigger 'readystatechange'
        if x[READY_STATE] is 1
          user.trigger 'loadstart'
        if x[READY_STATE] is 4
          user.trigger 'load'
          user.trigger 'loadend'
    else
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
    user.set READY_STATE, 4
    null

  user.serialize = ->
    props = {}
    for p in PROPS
      props[p] = x[p]
    method: data.method
    url: data.url
    async: data.async
    body: data.body
    responseHeaders: userResponseHeaders
    requestHeaders: userRequestHeaders
    props: props

  user.deserialize = (obj) ->
    for k in ['method', 'url', 'async', 'body']
      user[k] = obj[k] if obj[k]
    for h, v of obj.responseHeaders or {}
      user.setResponseHeader h, v
    for h, v of obj.requestHeaders or {}
      user.setRequestHeader h, v
    for p, v of obj.props or {}
      user.set p,v
    return

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
          if result is false
            console.log "cancel call ",key
            return 
          newargs = result if result

        #extract info
        switch key
          when "getAllResponseHeaders"
            return convertHeaders userResponseHeaders
          when "send"
            data.body = newargs[0]
          when "open"
            data.method = newargs[0]
            data.url = newargs[1]
            data.async = newargs[2]
          when "setRequestHeader"
            requestHeaders[newargs[0]] = newargs[1]
            return if userRequestHeaders[newargs[0]] isnt `undefined`

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
        convertHeaders xhr.getAllResponseHeaders(), responseHeaders

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
console.log "public!"
#publicise
window.xhook = xhook

