var http = require('http');
var port = parseInt(process.env.PORT,10) || 8000;

http.createServer(function(req, res) {

  res.end('!');

}).listen(port, function() {
  console.log("server on " + port);
});
