#for compression
document = window.document
BEFORE = 'before'
AFTER = 'after'
READY_STATE = 'readyState'
ON = 'addEventListener'
OFF = 'removeEventListener'
FIRE = 'dispatchEvent'
XMLHTTP = 'XMLHttpRequest'
FormData = 'FormData'

#DOWNLOAD_EVENTS ARE SYNTHESISED
UPLOAD_EVENTS = ['load', 'loadend', 'loadstart']
COMMON_EVENTS = ['progress', 'abort', 'error', 'timeout']

#if required, add coffeescripts indexOf method to Array
Array::indexOf or= (item) ->
  for x, i in this
    return i if x is item
  return -1

slice = (o,n) -> Array::slice.call o,n

mergeObjects = (src, dst) ->
  for k,v of src
    continue if k is "returnValue"
    try dst[k] = src[k]
  return dst

#proxy events from one emitter to another
proxyEvents = (events, src, dst) ->
  p = (event) -> (e) ->
    clone = {}
    for k of e
      continue if k is "returnValue"
      val = e[k]
      #replace instances of source emitter with dest emitter
      clone[k] = if val is src then dst else val
    clone
    dst[FIRE] event, clone
  #dont proxy manual events
  for event in events
    src["on#{event}"] = p(event)
  return

#create fake event
fakeEvent = (type) ->
  if document.createEventObject?
    msieEventObject = document.createEventObject()
    msieEventObject.type = type
    msieEventObject
  else
    # on some platforms like android 4.1.2 and safari on windows, it appears
    # that new Event is not allowed
    try new Event(type)
    catch then {type}

#tiny event emitter
EventEmitter = (nodeStyle) ->
  #private
  events = {}
  listeners = (event) ->
    events[event] or []
  #public
  emitter = {}
  emitter[ON] = (event, callback, i) ->
    events[event] = listeners event
    return if events[event].indexOf(callback) >= 0
    i = if i is `undefined` then events[event].length else i
    events[event].splice i, 0, callback
    return
  emitter[OFF] = (event, callback) ->
    i = listeners(event).indexOf callback
    return if i is -1
    listeners(event).splice i, 1
    return
  emitter[FIRE] = ->
    args = slice arguments
    event = args.shift()
    unless nodeStyle
      args[0] = mergeObjects args[0], fakeEvent event
    legacylistener = emitter["on#{event}"]
    if legacylistener
      legacylistener.apply `undefined`, args
    for listener, i in listeners(event).concat(listeners("*"))
      listener.apply `undefined`, args
    return

  #add listeners method and extra aliases
  if nodeStyle
    emitter.listeners = (event) ->
      slice listeners event
    emitter.on = emitter[ON]
    emitter.off = emitter[OFF]
    emitter.fire = emitter[FIRE]
    emitter.once = (e, fn) ->
      fire = ->
        emitter.off e, fire
        fn.apply null, arguments
      emitter.on e, fire
    emitter.destroy = ->
      events = {}

  emitter

#use event emitter to store hooks
xhook = EventEmitter(true)
xhook.EventEmitter = EventEmitter
xhook[BEFORE] = (handler, i) ->
  if handler.length < 1 or handler.length > 2
    throw "invalid hook"
  xhook[ON] BEFORE, handler, i
xhook[AFTER] = (handler, i) ->
  if handler.length < 2 or handler.length > 3
    throw "invalid hook"
  xhook[ON] AFTER, handler, i
xhook.enable = -> window[XMLHTTP] = XHookHttpRequest; return
xhook.disable = -> window[XMLHTTP] = xhook[XMLHTTP]; return

#helper
convertHeaders = xhook.headers = (h, dest = {}) ->
  switch typeof h
    when "object"
      headers = []
      for k,v of h
        name = k.toLowerCase()
        headers.push "#{name}:\t#{v}"
      return headers.join '\n'
    when "string"
      headers = h.split '\n'
      for header in headers
        if /([^:]+):\s*(.+)/.test(header)
          name = RegExp.$1?.toLowerCase()
          value = RegExp.$2
          dest[name] ?= value
      return dest
  return

#patch FormData
# we can do this safely because all XHR
# is hooked, so we can ensure the real FormData
# object is used on send
if xhook[FormData] = window[FormData]
  window[FormData] = (form) ->
    @fd = new xhook[FormData](form)
    @form = form
    entries = []
    Object.defineProperty @, 'entries', get: ->
      #extract form entries
      fentries = unless form then [] else
        slice(form.querySelectorAll("input,select")).filter((e) ->
          return e.type not in ['checkbox','radio'] or e.checked
        ).map((e) ->
          [e.name, if e.type is "file" then e.files else e.value]
        )
      #combine with js entries
      return fentries.concat entries
    @append = =>
      args = slice arguments
      entries.push args
      @fd.append.apply @fd, args
    return

#patch XHR
xhook[XMLHTTP] = window[XMLHTTP]
XHookHttpRequest = window[XMLHTTP] = ->

  xhr = new xhook[XMLHTTP]()

  #==========================
  # Extra state
  hasError = false
  transiting = false
  request = {}
  request.headers = {}
  response = {}
  response.headers = {}

  #==========================
  # Private API

  #read results from real xhr into response
  readHead = ->
    response.status = xhr.status
    response.statusText = xhr.statusText
    for key, val of convertHeaders xhr.getAllResponseHeaders()
      unless response.headers[key]
        name = key.toLowerCase()
        response.headers[name] = val
    return

  readBody = ->
    try response.text = xhr.responseText
    try response.xml = xhr.responseXML
    response.data = xhr.response or response.text
    return

  #write response into facade xhr
  writeHead = ->
    facade.status = response.status
    facade.statusText = response.statusText
    return

  writeBody = ->
    if response.hasOwnProperty 'text'
      facade.responseText = response.text
    if response.hasOwnProperty 'xml'
      facade.responseXML = response.xml
    facade.response = response.data or null
    return

  #ensure ready state 0 through 4 is handled
  emitReadyState = (n) ->
    while n > currentState and currentState < 4
      facade[READY_STATE] = ++currentState
      # make fake events for libraries that actually check the type on
      # the event object
      if currentState is 1
        facade[FIRE] "loadstart", {}
      if currentState is 2
        writeHead()
      if currentState is 4
        writeHead()
        writeBody()
      facade[FIRE] "readystatechange", {}
      #delay final events incase of error
      if currentState is 4
        setTimeout emitFinal, 0
    return

  emitFinal = ->
    unless hasError
      facade[FIRE] "load", {}
    facade[FIRE] "loadend", {}
    if hasError
      facade[READY_STATE] = 0
    return

  #control facade ready state
  currentState = 0
  setReadyState = (n) ->
    #emit events until readyState reaches 4
    if n isnt 4
      emitReadyState(n)
      return
    #before emitting 4, run all 'after' hooks in sequence
    hooks = xhook.listeners AFTER
    process = ->
      unless hooks.length
        return emitReadyState(4)
      hook = hooks.shift()
      if hook.length is 2
        hook request, response
        process()
      else if hook.length is 3 and request.async
        hook request, response, process
      else
        process()
    process()
    return

  #==========================
  # Facade XHR
  facade = request.xhr = EventEmitter()

  #==========================
  # Handle the underlying ready state
  xhr.onreadystatechange = (event) ->
    #pull status and headers
    try
      if xhr[READY_STATE] is 2
        readHead()
    #pull response data
    if xhr[READY_STATE] is 4
      transiting = false
      readHead()
      readBody()

    setReadyState xhr[READY_STATE]
    return

  #mark this xhr as errored
  hasErrorHandler = ->
    hasError = true
    return
  facade[ON] 'error', hasErrorHandler
  facade[ON] 'timeout', hasErrorHandler
  facade[ON] 'abort', hasErrorHandler
  # progress means we're current downloading...
  facade[ON] 'progress', ->
    #progress events are followed by readystatechange for some reason...
    if currentState < 3
      setReadyState 3
    else
      facade[FIRE] "readystatechange", {}
    return

  #proxy common events from xhr to facade
  proxyEvents COMMON_EVENTS, xhr, facade 

  # initialise 'withCredentials' on facade xhr in browsers with it
  # or if explicitly told to do so
  if 'withCredentials' of xhr or xhook.addWithCredentials
    facade.withCredentials = false
  facade.status = 0

  facade.open = (method, url, async, user, pass) ->
    request.method = method
    request.url = url
    request.async = async isnt false
    request.user = user
    request.pass = pass
    # openned facade xhr (not real xhr)
    setReadyState 1
    return

  facade.send = (body) ->
    #read xhr settings before hooking
    for k in ['type', 'timeout', 'withCredentials']
      modk = if k is "type" then "responseType" else k
      request[k] = facade[modk] if modk of facade

    request.body = body
    send = ->
      #prepare request all at once
      transiting = true
      #perform open
      xhr.open request.method, request.url, request.async, request.user, request.pass

      #write xhr settings
      for k in ['type', 'timeout', 'withCredentials']
        modk = if k is "type" then "responseType" else k
        xhr[modk] = request[k] if k of request

      #insert headers
      for header, value of request.headers
        xhr.setRequestHeader header, value
      #extract formdata
      if window[FormData] and request.body instanceof window[FormData]
        request.body = request.body.fd
      #real send!
      xhr.send request.body
      return

    hooks = xhook.listeners BEFORE
    #process hooks sequentially
    process = ->
      unless hooks.length
        return send()
      #go to next hook OR optionally provide response
      done = (userResponse) ->
        #break chain - provide dummy response (readyState 4)
        if typeof userResponse is 'object' and
           (typeof userResponse.status is 'number' or
            typeof response.status is 'number')
          mergeObjects userResponse, response
          unless 'data' in userResponse
            userResponse.data = userResponse.response or userResponse.text
          setReadyState 4
          return
        #continue processing until no hooks left
        process()
        return
      #specifically provide headers (readyState 2)
      done.head = (userResponse) ->
        mergeObjects userResponse, response
        setReadyState 2
      #specifically provide partial text (responseText  readyState 3)
      done.progress = (userResponse) ->
        mergeObjects userResponse, response
        setReadyState 3

      hook = hooks.shift()
      #async or sync?
      if hook.length is 1
        done hook request
      else if hook.length is 2 and request.async
        #async handlers must use an async xhr
        hook request, done
      else
        #skip async hook on sync requests
        done()
    #kick off
    process()
    return

  facade.abort = ->
    if transiting
      xhr.abort() #this will emit an 'abort' for us
    else
      facade[FIRE] 'abort', {}
    return
  facade.setRequestHeader = (header, value) ->
    name = header?.toLowerCase()
    request.headers[name] = value
    return
  facade.getResponseHeader = (header) ->
    name = header?.toLowerCase()
    response.headers[name]
  facade.getAllResponseHeaders = ->
    convertHeaders response.headers

  #proxy call only when supported
  if xhr.overrideMimeType
    facade.overrideMimeType = ->
      xhr.overrideMimeType.apply xhr, arguments

  #create emitter when supported
  if xhr.upload
    facade.upload = request.upload = EventEmitter()
    proxyEvents COMMON_EVENTS.concat(UPLOAD_EVENTS), xhr.upload, facade.upload

  return facade

#publicise
if typeof @define is "function" and @define.amd
  define "xhook", [], -> xhook
else
  (@exports or @).xhook = xhook
