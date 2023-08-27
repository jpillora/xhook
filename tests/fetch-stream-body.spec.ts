import { test, expect } from "@playwright/test";

test("fetch with stream body should not throw errors", async ({ page }) => {
  await page.goto("http://127.0.0.1:8080/example/common.html");
  const res = await page.evaluate(async () => {
    return new Promise(resolve => {
      const req = new Request("example1.txt", {
        method: "POST",
        body: "{}",
      });
      fetch(req)
        .then(res => {
          resolve(true);
        })
        .catch(err => {
          resolve(false);
        });
    });
  });
  expect(res).toEqual(true);
});
