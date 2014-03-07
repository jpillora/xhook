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
proxyEvents = (events, from, to) ->
  p = (event) -> (e) ->
    clone = {}
    for k of e
      continue if k is "returnValue"
      val = e[k]
      clone[k] = if val is from then to else val
    clone
    to[FIRE] event, clone
  #dont proxy manual events
  for event in events
    from["on#{event}"] = p(event)
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
xhook.addWithCredentials = true
xhook.enable = -> window[XMLHTTP] = XHookHttpRequest; return
xhook.disable = -> window[XMLHTTP] = xhook[XMLHTTP]; return

#helper
convertHeaders = xhook.headers = (h, dest = {}) ->
  switch typeof h
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

#patch FormData

xhook[FormData] = window[FormData]
window[FormData] = ->
  @fd = new xhook[FormData]
  @entries = []
  @append = (args...) =>
    @entries.push args
    @fd.append.apply @fd, args
  return

#patch XHR
xhook[XMLHTTP] = window[XMLHTTP]
XHookHttpRequest = window[XMLHTTP] = ->

  xhr = new xhook[XMLHTTP]()

  #==========================
  # Extra state
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
        response.headers[key] = val
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
    else if response.hasOwnProperty 'xml'
      facade.responseXML = response.xml
    else
      facade.response = response.data or null
    return

  #control facade ready state
  currentState = 0
  setReadyState = (n) ->

    #ensure ready state 0 through 4 is handled
    checkReadyState = ->
      while n > currentState and currentState < 4
        facade[READY_STATE] = ++currentState

        if currentState is 1
          facade[FIRE] "loadstart", {}
        if currentState is 2
          writeHead()
        if currentState is 4
          writeHead()
          writeBody()
        # make fake events here for libraries that actually check the type on
        # the event object
        facade[FIRE] "readystatechange", {}
        if currentState is 4
          facade[FIRE] "load", {}
          facade[FIRE] "loadend", {}
      return

    #fire hooks once readyState reaches 4
    if n < 4
      checkReadyState()
      return

    #run all 'after' hooks in sequence
    hooks = xhook.listeners AFTER
    process = ->
      unless hooks.length
        return checkReadyState()
      hook = hooks.shift()
      if hook.length is 2
        hook request, response
        process()
      else if hook.length is 3
        hook request, response, process
    process()
    return

  #==========================
  # Event Handlers

  #handle real ready state
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

  #==========================
  # Facade XHR
  facade = request.xhr = EventEmitter()

  # progress means we're current downloading...
  facade[ON] 'progress', -> setReadyState 3

  #proxy common events from xhr to facade
  proxyEvents COMMON_EVENTS, xhr, facade 

  if xhook.addWithCredentials
    # initialise 'withCredentials' on object so jQuery thinks we have CORS
    facade.withCredentials = false
  facade.status = 0

  facade.open = (method, url, async, user, pass) ->
    request.method = method
    request.url = url
    # async not allowed
    if async is false
      throw "sync xhr not supported by XHook"
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
      xhr.open request.method, request.url, true, request.user, request.pass

      #write xhr settings
      for k in ['type', 'timeout', 'withCredentials']
        modk = if k is "type" then "responseType" else k
        xhr[modk] = request[k] if k of request

      #insert headers
      for header, value of request.headers
        xhr.setRequestHeader header, value
      #extract formdata
      if request.body instanceof window[FormData]
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
      done = (resp) ->
        #break chain - provide dummy response (readyState 4)
        if typeof resp is 'object' and
           (typeof resp.status is 'number' or
            typeof response.status is 'number')
          mergeObjects resp, response
          setReadyState 4
          return
        #continue processing until no hooks left
        process()
        return
      #specifically provide headers (readyState 2)
      done.head = (resp) ->
        mergeObjects resp, response
        setReadyState 2
      #specifically provide partial text (responseText  readyState 3)
      done.progress = (resp) ->
        mergeObjects resp, response
        setReadyState 3

      hook = hooks.shift()
      #async or sync?
      if hook.length is 1
        done hook request
      else if hook.length is 2
        #async handlers must use an async xhr
        hook request, done
    #kick off
    process()
    return

  facade.abort = ->
    xhr.abort() if transiting
    facade[FIRE] 'abort', {}
    return
  facade.setRequestHeader = (header, value) ->
    request.headers[header] = value
    return
  facade.getResponseHeader = (header) ->
    response.headers[header]
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

  # TODO this may not be necessary...
  # #create method call watcher
  # calls = request.calls = EventEmitter(true)
  # wrapCall = (name, fn) -> ->
  #   calls.fire name, arguments
  #   fn.apply `undefined`, arguments
  # #wrap all facade methods
  # for k, fn of facade
  #   if typeof fn is 'function'
  #     facade[k] = wrapCall k, fn

  return facade

#publicise (mini-umd)
(@define or Object) (@exports or @).xhook = xhook

