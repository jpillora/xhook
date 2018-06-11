WINDOW = null;
if typeof WorkerGlobalScope isnt 'undefined' && self instanceof WorkerGlobalScope
  WINDOW = self
else if typeof global isnt 'undefined'
  WINDOW = global
else
  WINDOW = window

#for compression
document = WINDOW.document
BEFORE = 'before'
AFTER = 'after'
READY_STATE = 'readyState'
ON = 'addEventListener'
OFF = 'removeEventListener'
FIRE = 'dispatchEvent'
XMLHTTP = 'XMLHttpRequest'
FETCH = 'fetch'
FormData = 'FormData'

UPLOAD_EVENTS = ['load', 'loadend', 'loadstart']
COMMON_EVENTS = ['progress', 'abort', 'error', 'timeout']


#parse IE version
useragent = if typeof navigator isnt 'undefined' && navigator['useragent'] then navigator.userAgent else ''
msie = parseInt((/msie (\d+)/.exec((useragent).toLowerCase()) or [])[1])
msie = parseInt((/trident\/.*; rv:(\d+)/.exec((useragent).toLowerCase()) or [])[1])  if isNaN(msie)

#if required, add 'indexOf' method to Array
Array::indexOf or= (item) ->
  for x, i in this
    return i if x is item
  return -1

slice = (o,n) -> Array::slice.call o,n

depricatedProp = (p) ->
  return p in ["returnValue","totalSize","position"]

mergeObjects = (src, dst) ->
  for k,v of src
    continue if depricatedProp k
    try dst[k] = src[k]
  return dst

nullify = (res) ->
  if res is undefined
    return null
  return res

#proxy events from one emitter to another
proxyEvents = (events, src, dst) ->
  p = (event) -> (e) ->
    clone = {}
    #copies event, with dst emitter inplace of src
    for k of e
      continue if depricatedProp k
      val = e[k]
      clone[k] = if val is src then dst else val
    #emits out the dst
    dst[FIRE] event, clone
  #dont proxy manual events
  for event in events
    if dst._has event
      src["on#{event}"] = p(event)
  return

#create fake event
fakeEvent = (type) ->
  if document and document.createEventObject?
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
    #remove all
    if event is `undefined`
      events = {}
      return
    #remove all of type event
    if callback is `undefined`
      events[event] = []
    #remove particular handler
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
      legacylistener.apply emitter, args
    for listener, i in listeners(event).concat(listeners("*"))
      listener.apply emitter, args
    return
  emitter._has = (event) ->
    return !!(events[event] or emitter["on#{event}"])
  #add extra aliases
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
xhook.enable = ->
  WINDOW[XMLHTTP] = XHookHttpRequest
  WINDOW[FETCH] = XHookFetchRequest if typeof XHookFetchRequest is "function"
  WINDOW[FormData] = XHookFormData if NativeFormData
  return
xhook.disable = ->
  WINDOW[XMLHTTP] = xhook[XMLHTTP]
  WINDOW[FETCH] = xhook[FETCH]
  WINDOW[FormData] = NativeFormData if NativeFormData
  return

#helper
convertHeaders = xhook.headers = (h, dest = {}) ->
  switch typeof h
    when "object"
      headers = []
      for k,v of h
        name = k.toLowerCase()
        headers.push "#{name}:\t#{v}"
      return headers.join('\n') + '\n'
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
NativeFormData = WINDOW[FormData]
XHookFormData = (form) ->
  @fd = if form then new NativeFormData(form) else new NativeFormData()
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

if NativeFormData
  #expose native formdata as xhook.FormData incase its needed
  xhook[FormData] = NativeFormData
  WINDOW[FormData] = XHookFormData

#patch XHR
NativeXMLHttp = WINDOW[XMLHTTP]
xhook[XMLHTTP] = NativeXMLHttp
XHookHttpRequest = WINDOW[XMLHTTP] = ->
  ABORTED = -1
  xhr = new xhook[XMLHTTP]()

  #==========================
  # Extra state
  request = {}
  status = null
  hasError = undefined
  transiting = undefined
  response = undefined

  #==========================
  # Private API

  #read results from real xhr into response
  readHead = ->
    # Accessing attributes on an aborted xhr object will
    # throw an 'c00c023f error' in IE9 and lower, don't touch it.
    response.status = status or xhr.status
    response.statusText = xhr.statusText  unless status is ABORTED and msie < 10
    if status isnt ABORTED
        for key, val of convertHeaders xhr.getAllResponseHeaders()
          unless response.headers[key]
            name = key.toLowerCase()
            response.headers[name] = val
        return

  readBody = ->
    #https://xhr.spec.whatwg.org/
    if !xhr.responseType or xhr.responseType is "text"
      response.text = xhr.responseText
      response.data = xhr.responseText
      try
        response.xml = xhr.responseXML
      catch
        # unable to set responseXML due to response type, we attempt to assign responseXML
        # when the type is text even though it's against the spec due to several libraries
        # and browser vendors who allow this behavior. causing these requests to fail when
        # xhook is installed on a page.
    else if xhr.responseType is "document"
      response.xml = xhr.responseXML
      response.data = xhr.responseXML
    else
      response.data = xhr.response
    #new in some browsers
    if "responseURL" of xhr
      response.finalUrl = xhr.responseURL
    return

  #write response into facade xhr
  writeHead = ->
    facade.status = response.status
    facade.statusText = response.statusText
    return

  writeBody = ->
    if 'text' of response
      facade.responseText = response.text
    if 'xml' of response
      facade.responseXML = response.xml
    if 'data' of response
      facade.response = response.data
    if 'finalUrl' of response
      facade.responseURL = response.finalUrl
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
        if request.async is false
          emitFinal()
        else
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
      facade[FIRE] "readystatechange", {} #TODO fake an XHR event
    return

  # initialise 'withCredentials' on facade xhr in browsers with it
  # or if explicitly told to do so
  if 'withCredentials' of xhr or xhook.addWithCredentials
    facade.withCredentials = false
  facade.status = 0

  # initialise all possible event handlers
  for event in COMMON_EVENTS.concat(UPLOAD_EVENTS)
    facade["on#{event}"] = null

  facade.open = (method, url, async, user, pass) ->
    # Initailize empty XHR facade
    currentState = 0
    hasError = false
    transiting = false
    request.headers = {}
    request.headerNames = {}
    request.status = 0
    response = {}
    response.headers = {}

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
      #proxy all events from real xhr to facade
      proxyEvents COMMON_EVENTS, xhr, facade
      proxyEvents COMMON_EVENTS.concat(UPLOAD_EVENTS), xhr.upload, facade.upload if facade.upload

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
        if header
          xhr.setRequestHeader header, value
      #extract real formdata
      if request.body instanceof XHookFormData
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
    status = ABORTED;
    if transiting
      xhr.abort() #this will emit an 'abort' for us
    else
      facade[FIRE] 'abort', {}
    return
  facade.setRequestHeader = (header, value) ->
    #the first header set is used for all future case-alternatives of 'name'
    lName = header?.toLowerCase()
    name = request.headerNames[lName] = request.headerNames[lName] || header
    #append header to any previous values
    if request.headers[name]
      value = request.headers[name] + ', ' + value
    request.headers[name] = value
    return
  facade.getResponseHeader = (header) ->
    name = header?.toLowerCase()
    nullify(response.headers[name])
  facade.getAllResponseHeaders = ->
    nullify(convertHeaders response.headers)

  #proxy call only when supported
  if xhr.overrideMimeType
    facade.overrideMimeType = ->
      xhr.overrideMimeType.apply xhr, arguments

  #create emitter when supported
  if xhr.upload
    facade.upload = request.upload = EventEmitter()

  facade.UNSENT = 0
  facade.OPENED = 1
  facade.HEADERS_RECEIVED = 2
  facade.LOADING = 3
  facade.DONE = 4

  # fill in default values for an empty XHR object according to the spec
  facade.response = '';
  facade.responseText = '';
  facade.responseXML = null;
  facade.readyState = 0;
  facade.statusText = '';

  return facade

#patch Fetch
if typeof WINDOW[FETCH] is "function"
  NativeFetch = WINDOW[FETCH]
  xhook[FETCH] = NativeFetch
  XHookFetchRequest = WINDOW[FETCH] = (url, options = { headers: {} }) ->
    options.url = url
    request = null

    beforeHooks = xhook.listeners BEFORE
    afterHooks = xhook.listeners AFTER

    return new Promise((resolve, reject) ->

      getRequest = ->
        if options.body instanceof XHookFormData
          options.body = options.body.fd

        if options.headers
          options.headers = new Headers(options.headers)

        if (!request)
          request = new Request options.url, options

        return mergeObjects(options, request)

      processAfter = (response) ->
        unless afterHooks.length
          return resolve(response)

        hook = afterHooks.shift()

        if hook.length is 2
          hook getRequest(), response
          processAfter(response)
        else if hook.length is 3
          hook getRequest(), response, processAfter
        else
          processAfter(response)

      done = (userResponse) ->
        if userResponse != undefined
          response = new Response(userResponse.body or userResponse.text, userResponse)
          resolve(response)
          processAfter(response)
          return

        #continue processing until no hooks left
        processBefore()
        return

      processBefore = ->
        unless beforeHooks.length
          send()
          return

        hook = beforeHooks.shift()

        if hook.length is 1
          done hook(options)
        else if hook.length is 2
          hook getRequest(), done

      send = ->
        NativeFetch(getRequest())
          .then((response) -> processAfter(response))
          .catch((err) ->
            processAfter(err)
            reject(err)
        )

      processBefore()
      return
    )


XHookHttpRequest.UNSENT = 0;
XHookHttpRequest.OPENED = 1;
XHookHttpRequest.HEADERS_RECEIVED = 2;
XHookHttpRequest.LOADING = 3;
XHookHttpRequest.DONE = 4;

#publicise (amd+commonjs+window)
if typeof define is "function" and define.amd
  define "xhook", [], -> xhook
else if typeof module is "object" and module.exports
  module.exports = { xhook }
else if WINDOW
  WINDOW.xhook = xhook
