/* jshint browser: true */
/* global xhook, expect, describe, afterEach, it */

//XHook tests
// 1. run dev server with grunt-source --server=3000
// 2. visit localhost:3000/test
describe('xhook', function() {
  // Remove all hooks after each test.
  afterEach(function() {
    xhook.removeEventListener('before');
    xhook.removeEventListener('after');
  });

  it('should not modify url', function(done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../example/example1.txt');
    xhr.onload = function() {
      expect(xhr.responseText).to.contain('the first text file');
      done();
    };
    xhr.send();
  });

  it('should modify url', function(done) {
    xhook.before(function(req) {
      req.url = req.url.replace("example1", "example2");
    });
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../example/example1.txt');
    xhr.onload = function() {
      expect(xhr.responseText).to.contain('the second text file');
      done();
    };
    xhr.send();
  });

  it('should modify result', function(done) {
    xhook.after(function(req, resp) {
      resp.text = resp.text.replace("first", "third");
    });
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../example/example1.txt');
    xhr.onload = function() {
      expect(xhr.responseText).to.contain('the third text file');
      done();
    };
    xhr.send();
  });

  it('should support xhr reuse', function(done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../example/example1.txt');
    xhr.onload = function() {
      xhr.open('GET', '../example/example2.txt');
      xhr.onload = function() {
        done();
      };
      xhr.send();
    };
    xhr.send();
  });
});
