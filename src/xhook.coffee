#for compression
BEFORE = 'before'
AFTER = 'after'
READY_STATE = 'readyState'
INVALID_PARAMS_ERROR = "Invalid number or parameters. Please see API documentation."

#add coffeescripts indexOf method to Array
Array::indexOf or= (item) ->
  for x, i in this
    return i if x is item
  return -1

#tiny event emitter
EventEmitter = (ctx) ->
  events = {}
  listeners = (event) ->
    events[event] or []
  emitter =
    listeners: (event) -> Array::slice.call listeners event
    on: (event, callback, i) ->
      events[event] = listeners event
      return if events[event].indexOf(callback) >= 0
      i = if i is `undefined` then events[event].length else i
      events[event].splice i, 0, callback
      return
    off: (event, callback) ->
      i = listeners(event).indexOf callback
      return if i is -1
      listeners(event).splice i, 1
      return
    fire: (event, args...) ->
      for listener in listeners event
        listener.apply ctx, args
      return
  return emitter

#use event emitter to store hooks
pluginEvents = EventEmitter()
#main method
xhook = {}
xhook[BEFORE] = (handler, i) ->
  pluginEvents.on BEFORE, handler, i
xhook[AFTER] = (handler, i) ->
  pluginEvents.on AFTER, handler, i

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

#patch XMLHTTP
patchClass = (name) ->
  Class = window[name]
  return unless Class
  window[name] = (arg) ->
    return if typeof arg is "string" and not /\.XMLHTTP/.test(arg)
    createXHRFacade new Class(arg)
  return

patchClass "ActiveXObject"
patchClass "XMLHttpRequest"

#make patched version
createXHRFacade = (xhr) ->

  if pluginEvents.listeners(BEFORE).length is 0 and
     pluginEvents.listeners(AFTER).length is 0
    return xhr

  #==========================
  # Extra state
  transiting = false
  request =
    headers: {}
  response = null
  facadeEventEmitter = EventEmitter()

  #==========================
  # Private API
  readyHead = ->
    face.status = response.status
    face.statusText = response.statusText
    response.headers or= {}
    return

  readyBody = ->
    face.responseType = response.type or ''
    face.response = response.data or null
    face.responseText = response.text or response.data or ''
    face.responseXML = response.xml or null
    return

  copyHead = ->
    response.status = xhr.status
    response.statusText = xhr.statusText
    for key, val of convertHeaders xhr.getAllResponseHeaders()
      unless response.headers[key]
        response.headers[key] = val

  copyBody = ->
    response.type = xhr.responseType
    response.text = xhr.responseText
    response.data = xhr.response or response.text
    response.xml = xhr.responseXML

  currentState = 0
  setReadyState = (n) ->
    #pull in properties
    extractProps()
    #fire off events after hooks have run
    checkReadyState = ->
      while n > currentState and currentState < 4
        face[READY_STATE] = ++currentState
        if currentState is 2
          readyHead()
        if currentState is 4
          readyBody()
        # make fake events here for libraries that actually check the type on
        # the event object
        facadeEventEmitter.fire "readystatechange", makeFakeEvent("readystatechange")
        if currentState is 4
          faceEvents.fire "load", makeFakeEvent("load")
      return


    if n < 4
      return checkReadyState()

    hooks = pluginEvents.listeners AFTER
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
    if window.document.createEventObject?
      msieEventObject = window.document.createEventObject()
      msieEventObject.type = type
      msieEventObject
    else
      new Event(type)

  checkEvent = (e) ->
    clone = {}
    for key, val of e
      clone[key] = if val is xhr then face else val
    clone

  extractProps = ->
    for key in ['timeout']
      request[key] = xhr[key] if xhr[key] and request[key] is `undefined`
    for key, fn of face
      if typeof fn is 'function' and /^on(\w+)/.test key
        facadeEventEmitter.on RegExp.$1, fn
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
        copyHead()
        setReadyState 2

    # simulate data progress events?
    # TODO
    # if xhr[READY_STATE] is 3

    #pull response data
    if xhr[READY_STATE] is 4
      transiting = false
      copyHead()
      copyBody()
      setReadyState 4

    return

  #the rest of the events
  for event in ['abort','progress']
    xhr["on#{event}"] = (obj) ->
      facadeEventEmitter.fire event, checkEvent obj

  #==========================
  # Facade XHR
  face =
    withCredentials: false # initialise 'withCredentials' on object so jQuery thinks we have CORS
    response: null
    status: 0

  face.addEventListener = (event, fn) -> facadeEventEmitter.on event, fn
  face.removeEventListener = facadeEventEmitter.off
  face.dispatchEvent = ->

  face.open = (method, url, async) ->
    #TODO - user/password args
    request.method = method
    request.url = url
    request.async = async
    setReadyState 1
    return

  face.send = (body) ->
    request.body = body
    send = ->
      #prepare response
      response = { headers: {} }
      transiting = true
      xhr.open request.method, request.url, request.async
      xhr.timeout = request.timeout if request.timeout
      for header, value of request.headers
        xhr.setRequestHeader header, value
      xhr.send request.body
      return

    hooks = pluginEvents.listeners BEFORE
    #process 1 hook
    process = ->
      unless hooks.length
        return send()
      done = (resp) ->
        #dont send - dummy response
        if typeof resp is 'object' and typeof resp.status is 'number'
          response = resp
          setReadyState 4
          return
        #continue processing until no hooks left
        else
          process()
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

  face.abort = ->
    xhr.abort() if transiting
    facadeEventEmitter.fire 'abort', arguments
    return
  face.setRequestHeader = (header, value) ->
    request.headers[header] = value
    return
  face.getResponseHeader = (header) ->
    response.headers[header]
  face.getAllResponseHeaders = ->
    convertHeaders response.headers
  #TODO
  # face.overrideMimeType = ->
  #TODO
  face.upload = EventEmitter()

  return face
#publicise
window.xhook = xhook

