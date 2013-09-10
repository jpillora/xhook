var st = require('st');
var http = require('http');
var port = parseInt(process.env.PORT,10) || 8000;

http.createServer(
  st(process.cwd())
).listen(port, function() {
  console.log("server on " + port);
});