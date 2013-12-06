#for compression
document = window.document
BEFORE = 'before'
AFTER = 'after'
READY_STATE = 'readyState'
INVALID_PARAMS_ERROR = "Invalid number or parameters. Please see API documentation."
ON = 'addEventListener'
OFF = 'removeEventListener'
FIRE = 'dispatchEvent'
XMLHTTP = 'XMLHttpRequest'

#if required, add coffeescripts indexOf method to Array
Array::indexOf or= (item) ->
  for x, i in this
    return i if x is item
  return -1

#tiny event emitter
EventEmitter = (internal) ->
  #private
  events = {}
  listeners = (event) ->
    events[event] or []
  #public
  emitter = {}
  emitter[ON] = (event, callback, i) ->
    events[event] = listeners event
    return if events[event].indexOf(callback) >= 0
    i = if i is undefined then events[event].length else i
    events[event].splice i, 0, callback
    return
  emitter[OFF] = (event, callback) ->
    i = listeners(event).indexOf callback
    return if i is -1
    listeners(event).splice i, 1
    return
  emitter[FIRE] = (event, args...) ->
    for listener, i in listeners event
      console.log 'FIRE', i, event
      listener.apply undefined, args
    return

  #add listeners method and extra aliases
  if internal
    emitter.listeners = (event) ->
      Array::slice.call listeners event
    emitter.on = emitter[ON]
    emitter.off = emitter[OFF]
    emitter.fire = emitter[FIRE]

  emitter

#use event emitter to store hooks
xhook = EventEmitter(true)
xhook[BEFORE] = (handler, i) ->
  xhook[ON] BEFORE, handler, i
xhook[AFTER] = (handler, i) ->
  xhook[ON] AFTER, handler, i

#helper
convertHeaders = (h, dest = {}) ->
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

xhook.headers = convertHeaders

#patch XHR

xhook[XMLHTTP] = window[XMLHTTP]
window[XMLHTTP] = ->

  xhr = new xhook[XMLHTTP]()

  #==========================
  # Extra state
  transiting = false
  request = EventEmitter(true)
  request.headers = {}
  response = null

  #==========================
  # Private API
  writeHead = ->
    facade.status = response.status
    facade.statusText = response.statusText
    response.headers or= {}
    return

  writeBody = ->
    facade.responseType = response.type or ''
    facade.response = response.data or null
    facade.responseText = response.text or response.data or ''
    facade.responseXML = response.xml or null
    return

  readHead = ->
    response.status = xhr.status
    response.statusText = xhr.statusText
    for key, val of convertHeaders xhr.getAllResponseHeaders()
      unless response.headers[key]
        response.headers[key] = val

  readBody = ->
    response.type = xhr.responseType
    response.text = xhr.responseText
    response.data = xhr.response or response.text
    response.xml = xhr.responseXML

  currentState = 0
  setReadyState = (n) ->
    #pull in properties
    extractProps()

    #ensure ready state 0 through 4 is handled
    checkReadyState = ->
      while n > currentState and currentState < 4
        facade[READY_STATE] = ++currentState
        console.log 'READY STATE', facade[READY_STATE]
        if currentState is 2
          writeHead()
        if currentState is 4
          writeHead()
          writeBody()
        # make fake events here for libraries that actually check the type on
        # the event object
        facade[FIRE] "readystatechange", makeFakeEvent("readystatechange")
        if currentState is 4
          facade[FIRE] "load", makeFakeEvent("load")
          facade[FIRE] "loadend", makeFakeEvent("loadend")
      return

    #only check while not COMPLETE
    if n < 4
      checkReadyState()
      return

    #on COMPLETE, run all 'after' hooks
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
      else
        throw INVALID_PARAMS_ERROR
    process()
    return

  makeFakeEvent = (type) ->
    if document.createEventObject?
      msieEventObject = document.createEventObject()
      msieEventObject.type = type
      msieEventObject
    else
      # on some platforms like android 4.1.2 and safari on windows, it appears
      # that new Event is not allowed
      try new Event(type)
      catch then {type}

  checkEvent = (e) ->
    clone = {}
    for key, val of e
      clone[key] = if val is xhr then facade else val
    clone

  extractedProps = {}
  extractProps = ->
    console.log 'extract props...'
    for key in ['timeout']
      request[key] = xhr[key] if xhr[key] and request[key] is `undefined`
    for key, fn of facade
      if not extractedProps[key] and typeof fn is 'function' and /^on(\w+)/.test key
        event = RegExp.$1
        console.log 'LISTEN FOR EVENT', event
        facade[ON] event, fn
        extractedProps[key] = 1
    return

  #==========================
  # Event Handlers

  #react to *real* xhr ready state changes
  xhr.onreadystatechange = (event) ->

    # simulate transit progress events?
    # TODO
    # if xhr[READY_STATE] is 1

    #pull status and headers
    try
      if xhr[READY_STATE] is 2
        readHead()
        setReadyState 2

    # simulate data progress events?
    # TODO
    # if xhr[READY_STATE] is 3

    #pull response data
    if xhr[READY_STATE] is 4
      transiting = false
      readHead()
      readBody()
      setReadyState 4

    return

  # #the rest of the events
  # for event in ['abort','progress']
  #   console.log "listen on#{event}"
  #   xhr["on#{event}"] = (obj) ->
  #     console.log event, obj
  #     facade[FIRE] event, checkEvent obj

  #==========================
  # Facade XHR
  facade = EventEmitter()
  facade.withCredentials = false # initialise 'withCredentials' on object so jQuery thinks we have CORS
  facade.response = null
  facade.status = 0

  facade.open = (method, url, async) ->
    #TODO - user/password args
    request.method = method
    request.url = url
    
    setReadyState 1
    return

  facade.send = (body) ->
    #extract properties
    extractProps()

    request.body = body
    send = ->
      #prepare response
      response = { headers: {} }
      transiting = true
      # xhr.onprogress = (e) -> console.log('progress', e); return
      xhr.open request.method, request.url
      xhr.timeout = request.timeout if request.timeout
      for header, value of request.headers
        xhr.setRequestHeader header, value
      xhr.send request.body
      return

    hooks = xhook.listeners BEFORE
    #process 1 hook
    process = ->
      unless hooks.length
        return send()
      done = (resp) ->
        #break chain - provide dummy response
        if typeof resp is 'object' and typeof resp.status is 'number'
          response = resp
          setReadyState 4
          return
        #continue processing until no hooks left
        process()
        return
      hook = hooks.shift()
      #async or sync?
      if hook.length is 1
        done hook request
      else if hook.length is 2
        #async handlers must use an async xhr
        hook request, done
      else
        throw INVALID_PARAMS_ERROR
    #kick off
    process()
    return

  facade.abort = ->
    xhr.abort() if transiting
    facade[FIRE] 'abort', arguments
    return
  facade.setRequestHeader = (header, value) ->
    request.headers[header] = value
    return
  facade.getResponseHeader = (header) ->
    response.headers[header]
  facade.getAllResponseHeaders = ->
    convertHeaders response.headers

  if xhr.overrideMimeType
    facade.overrideMimeType = ->
      xhr.overrideMimeType.apply xhr, arguments

  #TODO
  # facade.upload = null

  return facade

#publicise
#TODO - UMD
window.xhook = xhook

