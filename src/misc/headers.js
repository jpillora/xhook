//helper
const CRLF = "\r\n";

const objectToString = function (headersObj) {
  const entries = Object.entries(headersObj);

  const headers = entries.map(([name, value]) => {
    return `${name.toLowerCase()}: ${value}`;
  });

  return headers.join(CRLF);
};

const stringToObject = function (headersString, dest) {
  const headers = headersString.split(CRLF);
  if (dest == null) {
    dest = {};
  }

  for (let header of headers) {
    if (/([^:]+):\s*(.+)/.test(header)) {
      const name = RegExp.$1 != null ? RegExp.$1.toLowerCase() : undefined;
      const value = RegExp.$2;
      if (dest[name] == null) {
        dest[name] = value;
      }
    }
  }

  return dest;
};

const convert = function (headers, dest) {
  switch (typeof headers) {
    case "object": {
      return objectToString(headers);
    }
    case "string": {
      return stringToObject(headers, dest);
    }
  }

  return [];
};

export default { convert };
