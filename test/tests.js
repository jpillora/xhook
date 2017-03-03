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

  describe('xhr', function() {

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

  describe('fetch', function() {

    it('should not modify url', function(done) {
      fetch('../example/example1.txt')
        .then(function(response) {
          return response.text()
        })
        .then(function(text) {
          expect(text).to.contain('the first text file');
          done();
        });
    });

    it('should modify url', function(done) {
      xhook.before(function(req) {
        req.url = req.url.replace("example1", "example2");
      });

      fetch('../example/example1.txt')
        .then(function(response) {
          return response.text()
        })
        .then(function(text) {
          expect(text).to.contain('the second text file');
          done();
        });
    });

    it('should modify result', function(done) {
      xhook.before(function(req, callback) {
        callback({
          text: 'the third text file'
        });
      });

      fetch('../example/example1.txt')
        .then(function(response) {
          return response.text()
        })
        .then(function(text) {
          expect(text).to.contain('the third text file');
          done();
        });
    });

    it('should call the afterHook when a request fails', function(done) {
      xhook.before(function(response) {
        expect(response.url).to.equal('http://127.0.0.1/api/example1.txt');
        done();
      });


      fetch('http://127.0.0.1/api/example1.txt')
        .then(function() {});
    });

    it('should call both before and after hooks', function(done) {
      var before = false;
      var after = false;

      xhook.before(function(req, callback) {
        before = true;
        callback({
          text: 'the third text file'
        });
      });

      xhook.after(function(req, resp) {
        after = true;
      });

      fetch('../example/example1.txt')
        .then(function(response) {
          return response.text()
        })
        .then(function(text) {
          expect(text).to.contain('the third text file');
          expect(before).to.equal(true);
          expect(after).to.equal(true);
          done();
        });
    });

    it ('should replace native fetch when enable is called', function(){
      xhook.disable();
      expect(typeof window.fetch).to.equal('function');
      expect((/\{\s*\[native code\]\s*\}/).test(window.fetch.toString())).to.equal(true);
      xhook.enable();
      expect(typeof window.fetch).to.equal('function');
      expect((/\{\s*\[native code\]\s*\}/).test(window.fetch.toString())).to.equal(false);
    });

    it('sync XHR should not fail', function(done) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '../example/example1.txt', false);
      xhr.onload = function() {
        expect(xhr.responseText).to.contain('the first text file');
        done();
      };

      xhr.send();
    });

  });


});
