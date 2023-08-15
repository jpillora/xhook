import { test, expect } from "@playwright/test";

test("event target should be xhr self", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/common.html");
  const res = await page.evaluate(async () => {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "example1.txt");
      xhr.addEventListener("load", function (e) {
        resolve(e.target === xhr);
      });
      xhr.send();
    });
  });
  expect(res).toEqual(true);
});
