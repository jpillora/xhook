#for compression
BEFORE_SEND = 'beforeSend'
AFTER_SEND = 'afterSend'
READY_STATE = 'readyState'
INVALID_PARAMS_ERROR = "Invalid number or parameters. Please see API documentation."

#add coffeescripts indexOf method to Array
Array::indexOf or= (item) ->
  for x, i in this
    return i if x is item
  return -1

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

#array of xhr hook (callback)s
pluginEvents = EventEmitter()
#main method
xhook = {}
xhook[BEFORE_SEND] = (handler, i) ->
  pluginEvents.on BEFORE_SEND, handler, i
xhook[AFTER_SEND] = (handler, i) ->
  pluginEvents.on AFTER_SEND, handler, i

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
    patchXhr new Class(arg)

patchClass "ActiveXObject"
patchClass "XMLHttpRequest"

#make patched version
patchXhr = (xhr) ->

  #==========================
  # Extra state
  transiting = false
  request = 
    timeout: 0
    headers: {}
  response = null
  xhrEvents = EventEmitter()

  #==========================
  # Private API

  readyHead = ->
    face.status = response.status
    face.statusText = response.statusText
    response.headers or= {}
    return

  readyBody = ->
    face.responseType = response.type or ''
    face.response = response.body or null
    face.responseText = response.text or response.body or ''
    face.responseXML = response.xml or null
    return

  currentState = 0
  setReadyState = (n) ->
    #pull in listeners
    extractListeners()
    #fire off events after hooks have run
    fire = ->
      while n > currentState and currentState < 4
        face[READY_STATE] = ++currentState
        if currentState is 2
          readyHead()
        if currentState is 4
          readyBody()
        xhrEvents.fire "readystatechange"
        if currentState is 4
          xhrEvents.fire "load"
      return

    return fire() if n < 4

    hooks = pluginEvents.listeners AFTER_SEND
    process = ->
      unless hooks.length
        return fire()
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

  checkEvent = (e) ->
    clone = {}
    for key, val of e
      clone[key] = if val is xhr then face else val
    clone

  extractListeners = ->
    for key, fn of face
      if typeof fn is 'function' and /^on(\w+)/.test key
        xhrEvents.on RegExp.$1, fn

  #==========================
  # Event Handlers


  #react to *real* xhr ready state changes
  xhr.onreadystatechange = (event) ->

    #pull status and headers
    if xhr[READY_STATE] is 2
      response.status = xhr.status
      response.statusText = xhr.statusText
      for key, val of convertHeaders xhr.getAllResponseHeaders()
        unless response.headers[key]
          response.headers[key] = val

    # simulate progress events?
    # TODO
    # if xhr[READY_STATE] is 3

    #pull response body
    if xhr[READY_STATE] is 4
      transiting = false
      response.type = xhr.responseType
      response.text = xhr.responseText
      response.body = xhr.response or response.text
      response.xml = xhr.responseXML
      setReadyState xhr[READY_STATE]

    return

  #==========================
  # Facade XHR
  face =
    withCredentials: false # initialise 'withCredentials' on object so jQuery thinks we have CORS
    response: null
    status: 0

  face.addEventListener = xhrEvents.on
  face.removeEventListener = xhrEvents.off
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
      for header, value of request.headers
        xhr.setRequestHeader header, value
      xhr.send request.body
      return

    hooks = pluginEvents.listeners BEFORE_SEND

    process = ->
      unless hooks.length
        return send()
      hook = hooks.shift()

      done = (resp) ->
        #dont send - dummy response
        if typeof resp is 'object' and typeof resp.status is 'number'
          response = resp
          setReadyState 4
          return
        #continue processing until no hooks left
        else
          process()

      if hook.length is 1
        done hook request
      else if hook.length is 2
        hook request, done
      else
        throw INVALID_PARAMS_ERROR
      
    process()
    return

  face.abort = ->
    xhr.abort() if transiting

  face.setRequestHeader = (header, value) ->
    request.headers[header] = value
  face.getResponseHeader = (header) ->
    response.headers[header]
  face.getAllResponseHeaders = ->
    convertHeaders response.headers
  face.overrideMimeType = ->
    #TODO
  face.upload = {}
    #TODO

  return face
#publicise
window.xhook = xhook

