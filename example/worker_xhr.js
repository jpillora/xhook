importScripts('../dist/xhook.js');

//hook and modify 'responseText' of 'example2.txt'
xhook.after(function(request, response) {
  if(request.url.match(/example2\.txt$/))
    response.text = response.text.replace(/[aeiou]/g,'z');
});

//vanilla calls
var xhr1 = new XMLHttpRequest();
xhr1.open('GET', 'example1.txt');
xhr1.onreadystatechange = function(e) {
  self.postMessage({ id: 'one', response: xhr1.responseText });
}
xhr1.send();

var xhr2 = new XMLHttpRequest();
xhr2.open('GET', 'example2.txt');
xhr2.onreadystatechange = function(e) {
  self.postMessage({ id: 'two', response: xhr2.responseText });
}
xhr2.send();
