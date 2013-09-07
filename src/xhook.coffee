
#XMLHTTP Object Properties
FNS = ["open", "setRequestHeader", "send", "abort", "getAllResponseHeaders", "getResponseHeader", "overrideMimeType"]
EVENTS = ["readystatechange", "progress", "loadstart", "loadend", "load", "error", "abort"]
PROPS = ["readyState", "responseText", "withCredentials", "statusText", "status", "response", "responseType", "responseXML", "upload"]

#for compression
READY_STATE = PROPS[0]
RESPONSE_TEXT = PROPS[1]
WITH_CREDS = PROPS[2]

create = (parent) ->
  F = ->
  F.prototype = parent
  new F
  
#array of xhr hook (callback)s
xhooks = []
#main method
xhook = (callback, i = xhooks.length) ->
  xhooks.splice i, 0, callback

#helper
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
xhook.PROPS = PROPS

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

  return xhr if xhooks.length is 0

  #keeps track of changes using "dirty-checking"
  xhrDup = {}

  #facade XHR - initialise 'withCredentials' on object so jQuery thinks we have CORS
  x = {}
  x[WITH_CREDS] = false

  #set modified values here
  requestHeaders = {}
  responseHeaders = {}
  data = {}

  eventListeners = {}

  #make fake events
  cloneEvent = (e) ->
    clone = {}
    for key, val of e or {}
      clone[key] = if val is xhr then x else val
    clone

  x.addEventListener = (event, fn) ->
    (eventListeners[event] = eventListeners[event] or []).push fn

  x.removeEventListener = (event, fn) ->
    fi = -1
    for f, i in eventListeners[event] or []
      if f is fn
        fi = i
    return if fi is -1
    eventListeners[event].splice fi, 1

  x.dispatchEvent = (event) ->
    user.trigger event

  #presented to the user for modifying
  user = create data

  userSets = {}
  user.set = (prop, val) ->
    
    userSets[prop] = 1
    if prop is READY_STATE
      while x[READY_STATE] < val
        x[READY_STATE]++
        continue if x[READY_STATE] is xhr[READY_STATE]
        user.trigger 'readystatechange'
        if x[READY_STATE] is 1
          user.trigger 'loadstart'
        if x[READY_STATE] is 4
          user.trigger 'load'
          user.trigger 'loadend'
    else
      x[prop] = val

  #user headers take precedence
  userRequestHeaders = create requestHeaders
  user.setRequestHeader = (key, val) ->
    
    userRequestHeaders[key] = val
    return unless data.opened
    xhr.setRequestHeader key, val

  userResponseHeaders = create responseHeaders
  user.setResponseHeader = (key, val) ->
    
    userResponseHeaders[key] = val

  userOnChanges = {}
  userOnCalls = {}
  user.onChange = (event, callback) ->
    
    (userOnChanges[event] = userOnChanges[event] or []).push callback
  user.onCall = (event, callback) ->
    
    (userOnCalls[event] = userOnCalls[event] or []).push callback
  user.trigger = (event, obj = {}) ->
    event = event.replace /^on/,''
    obj.type = event

    x['on'+event]?.call x, obj
    #addEventListener(blah, ...)
    for fn in eventListeners[event] or []
      fn.call x,obj
    return

  user.serialize = ->
    props = {}
    for p in PROPS
      props[p] = x[p]

    res = {}
    for k,v of userResponseHeaders
      res[k] = v

    req = {}
    for k,v of userRequestHeaders
      req[k] = v

    method: data.method
    url: data.url
    async: data.async
    body: data.body
    responseHeaders: res
    requestHeaders: req
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
    if xhr[fn]
      ((key) ->
        x[key] = (args...)->
          #extract data
          data.opened = not data.opened and key is 'open'
          data.sent = not data.sent and key is 'send'

          switch key
            #dont hook getResponseHeaders
            when "getAllResponseHeaders"
              return convertHeaders userResponseHeaders
            when "send"
              data.body = args[0]
            when "open"
              data.method = args[0]
              data.url = args[1]
              data.async = args[2]

          #run all hooks
          newargs = args
          callbacks = userOnCalls[key] or []
          for callback in callbacks
            result = callback args
            #cancel call
            if result is false
              # console.log "cancel call ",key
              return 
            newargs = result if result

          #make the original call - except for setting headers
          if key is "setRequestHeader"
            requestHeaders[newargs[0]] = newargs[1]
            #block if already set by user
            if userRequestHeaders[args[0]] isnt `undefined`
              return

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

    #react to *real* xhr ready state changes
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

    # console.log 'set %s: "%s" -> "%s"', prop, prev, x[prop]
    x[prop] = if override is `undefined` then curr else override

  #recieve event calls FROM xhr
  for eventName in EVENTS
    ((eventName) ->
      xhr[eventName] = (event) ->
        setAllValues()
        user.trigger eventName, cloneEvent(event)
    )("on#{eventName}")

  #set initial values
  setAllValues()
  
  #provide api into this XHR to the user 
  for callback in xhooks
    callback.call null, user

  return x
#publicise
window.xhook = xhook

