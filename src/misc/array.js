//if required, add 'indexOf' method to Array
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(item) {
    for (let i = 0; i < this.length; i++) {
      const x = this[i];
      if (x === item) {
        return i;
      }
    }
    return -1;
  };
}

const slice = (o, n) => Array.prototype.slice.call(o, n);

export { slice };
