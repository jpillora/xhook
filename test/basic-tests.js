var assert = require('assert');

require('../dist/1/xhook');

describe('integers', function () {
  it('should square the numbers', function (done) {
    assert.equal(2*2, 4);
    assert.equal(typeof xhook, 'object');
    done();
  });
});