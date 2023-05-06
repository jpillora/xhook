import { test, expect } from "@playwright/test";
import headers from "../src/misc/headers";

const CRLF = "\r\n";

const headersObj = {
  "cache-control": "no-cache",
  "content-encoding": "gzip",
  "content-type": "multipart/mixed",
};

const headersString = `cache-control: no-cache${CRLF}content-encoding: gzip${CRLF}content-type: multipart/mixed`;

test.describe("convert helper", function () {
  test("object to string", () => {
    const result = headers.convert(headersObj);
    expect(result).toEqual(headersString);
  });

  test("string to object", () => {
    const result = headers.convert(headersString);
    expect(result).toEqual(headersObj);
  });

  test("add result to dest when object", () => {
    const result = {};
    headers.convert(headersString, result);
    expect(result).toEqual(headersObj);
  });

  test("converts header name to lowercase", () => {
    const result = headers.convert({ Foo: "Bar" });
    expect(result).toEqual("foo: Bar");
  });
});
