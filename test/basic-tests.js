var expect = chai.expect;

describe('xhook', function() {
  after(function() {
    // Remove all handlers after each test.
    xhook.removeEventListener('before');
    xhook.removeEventListener('after');
  });

  it('should support xhr reuse', function(done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../example/example1.txt');
    xhr.onload = function() {
      xhr.open('GET', '../example/example2.txt');
      xhr.onload = function() {
        done();
      }
      xhr.send();
    }
    xhr.send();
  });
});
