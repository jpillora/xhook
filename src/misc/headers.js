//helper
const convert = function(h, dest) {
  let name;
  if (dest == null) {
    dest = {};
  }
  switch (typeof h) {
    case "object":
      var headers = [];
      for (let k in h) {
        const v = h[k];
        name = k.toLowerCase();
        headers.push(`${name}:\t${v}`);
      }
      return headers.join("\n") + "\n";
    case "string":
      headers = h.split("\n");
      for (let header of Array.from(headers)) {
        if (/([^:]+):\s*(.+)/.test(header)) {
          name = RegExp.$1 != null ? RegExp.$1.toLowerCase() : undefined;
          const value = RegExp.$2;
          if (dest[name] == null) {
            dest[name] = value;
          }
        }
      }
      return dest;
  }
  return [];
};

export default { convert };
