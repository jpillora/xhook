importScripts('../dist/xhook.js');

xhook.after(function(request, response, cb) {
  if (request.url.match(/example2\.txt$/)) {
    response.text().then(function (text) {
      var newResponse = text.replace(/[aeiou]/g, 'z');
      cb(new Response(newResponse))
    });
  } else {
    cb(response);
  }
});

//fetch calls
fetch('example1.txt')
  .then(function(response) {
    return response.text();
  })
  .then(function(response) {
    self.postMessage({ id: 'one', response: response });
  });

fetch('example2.txt')
  .then(function(response) {
    return response.text();
  })
  .then(function(response) {
    self.postMessage({ id: 'two', response: response });
  });
