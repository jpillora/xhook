# EVENTS = ["readystatechange", "progress", "loadstart", "loadend", "load", "error", "abort"]

#for compression
XHOOK = 'xhook'
READY_STATE = 'readyState'

EventEmitter = (ctx) ->
  stats: {}
  events = {}
  emitter =
    stats: stats
    on: (event, callback, i) ->
      events[event] = [] unless events[event]
      events[event].splice i or events[event].length, 0, callback
      return
    off: (event, callback) ->
      return unless events[event]
      r = -1
      for f, i in events[event]
        if f is fn
          r = i
      return if r is -1
      events[event].splice r, 1
      return
    each: (event, callback) ->
      return unless events[event]
      stats[event] = (stats[event] + 1) or 1
      for cb in events[event]
        callback cb
      return
    fire: (event, args...) ->
      emitter.each event, (fn) ->
        fn.apply ctx, args
      return
  return emitter

#array of xhr hook (callback)s
pluginEvents = EventEmitter()
#main method
xhook = (callback, i) -> pluginEvents.on XHOOK, callback, i

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
    patchXhr new Class(arg)

patchClass "ActiveXObject"
patchClass "XMLHttpRequest"

#make patched version
patchXhr = (xhr) ->

  #==========================
  # Extra state
  readys = []
  targetState = 0
  request = { headers: {} }
  response = { headers: {} }
  xhrEvents = EventEmitter()

  #==========================
  # User API
  user = { request, response }

  user.serialize = ->
    { request, response }

  user.deserialize = (obj) ->
    request = obj.request
    response = obj.response

  #==========================
  # Private API
  

  setReadyState = (n) ->
    face[READY_STATE] = n
    xhrEvents.fire "readystatechange"

  checkEvent = (e) ->
    clone = {}
    for key, val of e
      clone[key] = if val is xhr then face else val
    clone

  #==========================
  # Event Handlers


  #react to *real* xhr ready state changes
  xhr.onreadystatechange = (event) ->

    readys.push checkEvent event

    #pull status and headers
    if xhr[READY_STATE] is 2
      response.status = xhr.status
      response.statusText = xhr.statusText
      for key, val of convertHeaders xhr.getAllResponseHeaders()
        unless response.headers[key]
          response.headers[key] = val
    #pull response body
    if xhr[READY_STATE] is 4
      response.resp = xhr.response
      response.body = xhr.responseText
      response.xml = xhr.responseXML

    # xhrEvents.fire eventName, cloneEvent(event)

  #==========================
  # Facade XHR
  face = { withCredentials: false} # initialise 'withCredentials' on object so jQuery thinks we have CORS
  face.addEventListener = xhrEvents.on
  face.removeEventListener = xhrEvents.off
  face.dispatchEvent = ->

  face.open = (method, url, async) ->
    request.method = method
    request.url = url
    request.async = async
    targetState = 1
    return

  face.send = (body) ->
    request.body = body
    send = ->
      xhr.open request.method, request.url, request.async
      xhr.send request.body
      targetState = 4

    if user.beforeSend
      user.beforeSend send
    else      
      send()
    return

  face.abort = ->

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


  #provide api into this XHR to the user 
  pluginEvents.fire XHOOK, user

  return face
#publicise
window[XHOOK] = xhook

